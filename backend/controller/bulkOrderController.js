import { supabase } from "../config/supabaseClient.js";

// B2B Bulk Order Enquiry Functions
export const createBulkOrderEnquiry = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      productName,
      quantity,
      description,
      expectedPrice,
      deliveryTimeline,
      gstNumber,
      address
    } = req.body;

    const { data, error } = await supabase
      .from('bulk_order_enquiries')
      .insert([{
        company_name: companyName,
        contact_person: contactPerson,
        email,
        phone,
        product_name: productName,
        quantity,
        description,
        expected_price: expectedPrice,
        delivery_timeline: deliveryTimeline,
        gst_number: gstNumber,
        address,
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    // Send email notification to admin (optional - implement if needed)
    // await sendBulkOrderNotificationToAdmin(data);

    return res.json({ 
      success: true, 
      message: 'Bulk order enquiry submitted successfully',
      enquiry: data 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getBulkOrderEnquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bulk_order_enquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      enquiries: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBulkOrderEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const { data, error } = await supabase
      .from('bulk_order_enquiries')
      .update({
        status,
        admin_notes: adminNotes,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, enquiry: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Wholesale Bulk Order Functions (Integrated Checkout)
export const createWholesaleBulkOrder = async (req, res) => {
  try {
    const {
      user_id,
      items,
      total_price,
      email,
      contact,
      shipping_address,
      billing_address,
      company_name,
      gst_number
    } = req.body;

    // Create wholesale bulk order
    const { data: order, error: orderError } = await supabase
      .from('wholesale_bulk_orders')
      .insert([{
        user_id,
        total_price,
        email,
        contact,
        company_name,
        gst_number,
        shipping_first_name: shipping_address.firstName,
        shipping_last_name: shipping_address.lastName,
        shipping_full_address: shipping_address.fullAddress,
        shipping_apartment: shipping_address.apartment,
        shipping_city: shipping_address.city,
        shipping_country: shipping_address.country,
        shipping_state: shipping_address.state,
        shipping_zip_code: shipping_address.zipCode,
        billing_first_name: billing_address?.firstName,
        billing_last_name: billing_address?.lastName,
        billing_full_address: billing_address?.fullAddress,
        billing_apartment: billing_address?.apartment,
        billing_city: billing_address?.city,
        billing_country: billing_address?.country,
        billing_state: billing_address?.state,
        billing_zip_code: billing_address?.zipCode,
        payment_status: 'PAYMENT_PENDING'
      }])
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ success: false, error: orderError.message });
    }

    // Create order items
    const orderItems = items.map(item => ({
      wholesale_bulk_order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      is_bulk_order: item.is_bulk_order || true,
      bulk_range: item.bulk_range,
      original_price: item.original_price
    }));

    const { error: itemsError } = await supabase
      .from('wholesale_bulk_order_items')
      .insert(orderItems);

    if (itemsError) {
      return res.status(500).json({ success: false, error: itemsError.message });
    }

    // Clear cart if user_id provided
    if (user_id) {
      await supabase.from('cart_items').delete().eq('user_id', user_id);
    }

    return res.json({ 
      success: true, 
      message: 'Bulk order created successfully',
      order 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getWholesaleBulkOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('wholesale_bulk_orders')
      .select(`
        *,
        wholesale_bulk_order_items(
          id,
          product_id,
          quantity,
          price,
          is_bulk_order,
          bulk_range,
          original_price,
          products(id, name, image)
        )
      `, { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('order_status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      orders: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateWholesaleBulkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const updateData = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    const { data, error } = await supabase
      .from('wholesale_bulk_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, order: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Enhanced order creation with bulk support
export const createOrderWithBulkSupport = async (req, res) => {
  try {
    const {
      user_id,
      items,
      subtotal,
      shipping,
      total,
      detailedAddress,
      payment_method,
      company_name,
      gst_number,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      gpsLocation
    } = req.body;

    // Check if any items are bulk orders
    const hasBulkItems = items.some(item => item.is_bulk_order);

    // Create address string
    const addressString = [
      detailedAddress.houseNumber && detailedAddress.streetAddress
        ? `${detailedAddress.houseNumber} ${detailedAddress.streetAddress}`
        : detailedAddress.streetAddress,
      detailedAddress.suiteUnitFloor,
      detailedAddress.locality,
      detailedAddress.area,
      detailedAddress.city,
      detailedAddress.state,
      detailedAddress.postalCode,
      detailedAddress.country || "India",
      detailedAddress.landmark ? `Near ${detailedAddress.landmark}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const orderData = {
      user_id,
      subtotal,
      shipping,
      total,
      address: addressString,
      payment_method: hasBulkItems ? 'bulk_order' : payment_method,
      is_bulk_order: hasBulkItems,
      bulk_order_type: hasBulkItems ? 'integrated' : null,
      company_name,
      gst_number,
      shipping_house_number: detailedAddress.houseNumber,
      shipping_street_address: detailedAddress.streetAddress,
      shipping_suite_unit_floor: detailedAddress.suiteUnitFloor,
      shipping_locality: detailedAddress.locality,
      shipping_area: detailedAddress.area,
      shipping_city: detailedAddress.city,
      shipping_state: detailedAddress.state,
      shipping_postal_code: detailedAddress.postalCode,
      shipping_country: detailedAddress.country || "India",
      shipping_landmark: detailedAddress.landmark,
      shipping_latitude: gpsLocation?.latitude || null,
      shipping_longitude: gpsLocation?.longitude || null,
      shipping_gps_address: gpsLocation?.formatted_address || null,
    };

    // Add payment details only for non-bulk orders
    if (!hasBulkItems && razorpay_order_id) {
      orderData.razorpay_order_id = razorpay_order_id;
      orderData.razorpay_payment_id = razorpay_payment_id;
      orderData.razorpay_signature = razorpay_signature;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ success: false, error: orderError.message });
    }

    // Create order items
    const orderItemsToInsert = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      quantity: item.quantity,
      price: item.price,
      is_bulk_order: item.is_bulk_order || false,
      bulk_range: item.bulk_range || null,
      original_price: item.original_price || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      return res.status(500).json({ success: false, error: itemsError.message });
    }

    // Clear cart
    if (user_id) {
      await supabase.from("cart_items").delete().eq("user_id", user_id);
    }

    return res.json({ 
      success: true, 
      order,
      isBulkOrder: hasBulkItems,
      message: hasBulkItems ? 'Bulk order created successfully. Our team will contact you soon.' : 'Order placed successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};