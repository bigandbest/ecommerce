import { supabase } from '../config/supabaseClient.js';

// Get products available in a specific pincode
const getProductsByPincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    const { category, limit = 50 } = req.query;

    // Get warehouses serving this pincode
    const { data: warehouseMappings, error: mappingError } = await supabase
      .from('pincode_warehouse_mapping')
      .select(`
        warehouse_id,
        priority,
        delivery_time,
        warehouses (
          id,
          name,
          address
        )
      `)
      .eq('pincode', pincode)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (mappingError || !warehouseMappings.length) {
      return res.status(404).json({
        success: false,
        message: 'No delivery available for this pincode'
      });
    }

    const warehouseIds = warehouseMappings.map(m => m.warehouse_id);

    // Get products with inventory from these warehouses
    let query = supabase
      .from('warehouse_inventory')
      .select(`
        product_id,
        variant_id,
        available_quantity,
        warehouse_id,
        products (
          id,
          name,
          description,
          price,
          old_price,
          image,
          category,
          brand_name,
          active
        ),
        product_variants (
          id,
          variant_name,
          variant_value,
          price,
          mrp,
          weight
        )
      `)
      .in('warehouse_id', warehouseIds)
      .gt('available_quantity', 0);

    if (category) {
      query = query.eq('products.category', category);
    }

    const { data: inventory, error: inventoryError } = await query.limit(parseInt(limit));

    if (inventoryError) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching inventory',
        error: inventoryError.message
      });
    }

    // Group by product and calculate total availability
    const productMap = new Map();

    inventory.forEach(item => {
      const productId = item.product_id;
      const variantId = item.variant_id;
      const key = `${productId}-${variantId || 'default'}`;

      if (!productMap.has(key)) {
        const warehouse = warehouseMappings.find(w => w.warehouse_id === item.warehouse_id);
        
        productMap.set(key, {
          ...item.products,
          variant: item.product_variants,
          total_stock: item.available_quantity,
          delivery_time: warehouse?.delivery_time || '1-2 days',
          warehouse_name: warehouse?.warehouses?.name,
          is_available: true
        });
      } else {
        const existing = productMap.get(key);
        existing.total_stock += item.available_quantity;
      }
    });

    const availableProducts = Array.from(productMap.values());

    res.json({
      success: true,
      data: {
        pincode,
        total_products: availableProducts.length,
        products: availableProducts,
        serving_warehouses: warehouseMappings.map(w => ({
          id: w.warehouse_id,
          name: w.warehouses.name,
          delivery_time: w.delivery_time,
          priority: w.priority
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check if specific product is available in pincode
const checkProductAvailability = async (req, res) => {
  try {
    const { pincode, productId } = req.params;
    const { variantId } = req.query;

    // Get warehouses serving this pincode
    const { data: warehouseMappings, error: mappingError } = await supabase
      .from('pincode_warehouse_mapping')
      .select('warehouse_id, delivery_time, priority')
      .eq('pincode', pincode)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (mappingError || !warehouseMappings.length) {
      return res.json({
        success: true,
        data: {
          is_available: false,
          message: 'Delivery not available in this area'
        }
      });
    }

    const warehouseIds = warehouseMappings.map(m => m.warehouse_id);

    // Check inventory
    let query = supabase
      .from('warehouse_inventory')
      .select('available_quantity, warehouse_id')
      .eq('product_id', productId)
      .in('warehouse_id', warehouseIds)
      .gt('available_quantity', 0);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    } else {
      query = query.is('variant_id', null);
    }

    const { data: inventory, error: inventoryError } = await query;

    if (inventoryError) {
      return res.status(500).json({
        success: false,
        message: 'Error checking availability',
        error: inventoryError.message
      });
    }

    const totalStock = inventory.reduce((sum, item) => sum + item.available_quantity, 0);
    const nearestWarehouse = warehouseMappings.find(w => 
      inventory.some(inv => inv.warehouse_id === w.warehouse_id)
    );

    res.json({
      success: true,
      data: {
        is_available: totalStock > 0,
        total_stock: totalStock,
        delivery_time: nearestWarehouse?.delivery_time || '1-2 days',
        message: totalStock > 0 ? 'Available for delivery' : 'Out of stock in your area'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add/Update warehouse inventory (Admin)
const updateWarehouseInventory = async (req, res) => {
  try {
    const { warehouse_id, product_id, variant_id, stock_quantity } = req.body;

    const { data, error } = await supabase
      .from('warehouse_inventory')
      .upsert({
        warehouse_id,
        product_id,
        variant_id: variant_id || null,
        stock_quantity,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'warehouse_id,product_id,variant_id'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating inventory',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get warehouse inventory (Admin)
const getWarehouseInventory = async (req, res) => {
  try {
    const { warehouseId } = req.params;

    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select(`
        *,
        products (
          id,
          name,
          image,
          category
        ),
        product_variants (
          id,
          variant_name,
          variant_value
        )
      `)
      .eq('warehouse_id', warehouseId)
      .order('last_updated', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching inventory',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export {
  getProductsByPincode,
  checkProductAvailability,
  updateWarehouseInventory,
  getWarehouseInventory
};