import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Select,
  Switch,
  Table,
  Modal,
  TextInput,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Tabs,
  MultiSelect,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import api from "../../utils/api";

const StoreSectionMapping = () => {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [mappings, setMappings] = useState([]);

  // Modal states
  const [storeMappingModal, setStoreMappingModal] = useState(false);
  const [productMappingModal, setProductMappingModal] = useState(false);

  // Form states
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("store-mapping");

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [storesRes, sectionsRes, productsRes, mappingsRes] =
        await Promise.all([
          api.get("/recommended-stores/list"),
          api.get("/store-section-mappings/product-sections/list"),
          api.get("/productsroute/allproducts"),
          api.get("/store-section-mappings/list"),
        ]);

      setStores(storesRes.data.recommendedStores || []);
      setSections(sectionsRes.data.sections || []);
      setProducts(productsRes.data.products || []);
      setMappings(mappingsRes.data.mappings || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Store-Section Mapping Functions
  const handleStoreMapping = async () => {
    if (!selectedStore || selectedSections.length === 0) return;

    try {
      await api.post("/store-section-mappings/store-sections", {
        store_id: selectedStore,
        section_ids: selectedSections,
      });

      setStoreMappingModal(false);
      setSelectedStore("");
      setSelectedSections([]);
      fetchInitialData();
    } catch (error) {
      console.error("Failed to create store-section mapping:", error);
    }
  };

  // Product-Section Mapping Functions
  const handleProductMapping = async () => {
    if (!selectedSection || selectedProducts.length === 0) return;

    try {
      await api.post("/store-section-mappings/section-products", {
        section_id: selectedSection,
        product_ids: selectedProducts,
      });

      setProductMappingModal(false);
      setSelectedSection("");
      setSelectedProducts([]);
      fetchInitialData();
    } catch (error) {
      console.error("Failed to create product-section mapping:", error);
    }
  };

  // Toggle mapping status
  const toggleMappingStatus = async (mappingId, currentStatus) => {
    try {
      await api.put(`/store-section-mappings/${mappingId}/status`, {
        is_active: !currentStatus,
      });
      fetchInitialData();
    } catch (error) {
      console.error("Failed to update mapping status:", error);
    }
  };

  // Delete mapping
  const deleteMapping = async (mappingId) => {
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        await api.delete(`/store-section-mappings/${mappingId}`);
        fetchInitialData();
      } catch (error) {
        console.error("Failed to delete mapping:", error);
      }
    }
  };

  // Format options for selects
  const storeOptions = stores.map((store) => ({
    value: store.id.toString(),
    label: store.name,
  }));

  const sectionOptions = sections.map((section) => ({
    value: section.id.toString(),
    label: `${section.section_name} (${section.section_key})`,
  }));

  const productOptions = products.map((product) => ({
    value: product.id.toString(),
    label: `${product.name} - ₹${product.price}`,
  }));

  // Table columns for store-section mappings
  const storeSectionColumns = [
    {
      accessor: "store_name",
      title: "Store Name",
    },
    {
      accessor: "sections",
      title: "Mapped Sections",
      render: (mapping) => (
        <div className="flex flex-wrap gap-1">
          {mapping.sections?.map((section) => (
            <Badge key={section.id} size="sm" variant="light">
              {section.section_name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessor: "is_active",
      title: "Status",
      render: (mapping) => (
        <Switch
          checked={mapping.is_active}
          onChange={() => toggleMappingStatus(mapping.id, mapping.is_active)}
        />
      ),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (mapping) => (
        <Group spacing="xs">
          <Tooltip label="Delete mapping">
            <ActionIcon color="red" onClick={() => deleteMapping(mapping.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  // Table columns for section-product mappings
  const sectionProductColumns = [
    {
      accessor: "section_name",
      title: "Section Name",
    },
    {
      accessor: "products",
      title: "Mapped Products",
      render: (mapping) => (
        <div className="flex flex-wrap gap-1">
          {mapping.products?.slice(0, 3).map((product) => (
            <Badge key={product.id} size="sm" variant="outline">
              {product.name}
            </Badge>
          ))}
          {mapping.products?.length > 3 && (
            <Badge size="sm" variant="light">
              +{mapping.products.length - 3} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessor: "is_active",
      title: "Status",
      render: (mapping) => (
        <Switch
          checked={mapping.is_active}
          onChange={() => toggleMappingStatus(mapping.id, mapping.is_active)}
        />
      ),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (mapping) => (
        <Group spacing="xs">
          <Tooltip label="Delete mapping">
            <ActionIcon color="red" onClick={() => deleteMapping(mapping.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <div className="p-6">
      <LoadingOverlay visible={loading} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Store & Section Mapping
        </h1>
        <Text color="gray" size="sm">
          Manage store-section relationships and product assignments
        </Text>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab} className="mb-6">
        <Tabs.List>
          <Tabs.Tab value="store-mapping" icon={<IconSettings size={16} />}>
            Store-Section Mapping
          </Tabs.Tab>
          <Tabs.Tab value="product-mapping" icon={<IconPlus size={16} />}>
            Product-Section Mapping
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="store-mapping" pt="lg">
          <Card shadow="sm" p="lg" radius="md" className="mb-6">
            <Group position="apart" className="mb-4">
              <Text weight={500}>Store-Section Mappings</Text>
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={() => setStoreMappingModal(true)}
              >
                Map Store to Sections
              </Button>
            </Group>

            <Table>
              <thead>
                <tr>
                  {storeSectionColumns.map((col) => (
                    <th key={col.accessor}>{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappings
                  .filter((m) => m.type === "store-section")
                  .map((mapping) => (
                    <tr key={mapping.id}>
                      {storeSectionColumns.map((col) => (
                        <td key={col.accessor}>
                          {col.render
                            ? col.render(mapping)
                            : mapping[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="product-mapping" pt="lg">
          <Card shadow="sm" p="lg" radius="md" className="mb-6">
            <Group position="apart" className="mb-4">
              <Text weight={500}>Product-Section Mappings</Text>
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={() => setProductMappingModal(true)}
              >
                Add Products to Section
              </Button>
            </Group>

            <Table>
              <thead>
                <tr>
                  {sectionProductColumns.map((col) => (
                    <th key={col.accessor}>{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappings
                  .filter((m) => m.type === "section-product")
                  .map((mapping) => (
                    <tr key={mapping.id}>
                      {sectionProductColumns.map((col) => (
                        <td key={col.accessor}>
                          {col.render
                            ? col.render(mapping)
                            : mapping[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Store-Section Mapping Modal */}
      <Modal
        opened={storeMappingModal}
        onClose={() => setStoreMappingModal(false)}
        title="Map Store to Sections"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Select Store"
            placeholder="Choose a store"
            data={storeOptions}
            value={selectedStore}
            onChange={setSelectedStore}
            required
          />

          <MultiSelect
            label="Select Sections"
            placeholder="Choose sections to map"
            data={sectionOptions}
            value={selectedSections}
            onChange={setSelectedSections}
            required
          />

          <Group position="right" mt="md">
            <Button
              variant="subtle"
              onClick={() => setStoreMappingModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStoreMapping}>Create Mapping</Button>
          </Group>
        </div>
      </Modal>

      {/* Product-Section Mapping Modal */}
      <Modal
        opened={productMappingModal}
        onClose={() => setProductMappingModal(false)}
        title="Add Products to Section"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Select Section"
            placeholder="Choose a section"
            data={sectionOptions}
            value={selectedSection}
            onChange={setSelectedSection}
            required
          />

          <MultiSelect
            label="Select Products"
            placeholder="Choose products to add"
            data={productOptions}
            value={selectedProducts}
            onChange={setSelectedProducts}
            searchable
            required
          />

          <Group position="right" mt="md">
            <Button
              variant="subtle"
              onClick={() => setProductMappingModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProductMapping}>Add Products</Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
};

export default StoreSectionMapping;
