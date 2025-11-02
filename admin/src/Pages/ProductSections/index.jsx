import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Table,
  Switch,
  Button,
  Badge,
  TextInput,
  Modal,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Textarea,
  LoadingOverlay,
  Alert,
  Card,
  Stack,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconEdit,
  IconArrowUp,
  IconArrowDown,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

const ProductSectionsManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({
    section_name: "",
    description: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND ||
    "http://localhost:8000/api";

  // Fetch all product sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/product-sections`);
      const data = await response.json();

      if (data.success) {
        setSections(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch sections");
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch product sections",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle section active status
  const toggleSectionStatus = async (sectionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product-sections/${sectionId}/toggle`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSections(
          sections.map((section) =>
            section.id === sectionId
              ? { ...section, is_active: !section.is_active }
              : section
          )
        );
        notifications.show({
          title: "Success",
          message: data.message,
          color: "green",
        });
      } else {
        throw new Error(data.error || "Failed to toggle section status");
      }
    } catch (error) {
      console.error("Error toggling section status:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update section status",
        color: "red",
      });
    }
  };

  // Update section
  const updateSection = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(
        `${API_BASE_URL}/product-sections/${selectedSection.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSections(
          sections.map((section) =>
            section.id === selectedSection.id ? data.data : section
          )
        );
        notifications.show({
          title: "Success",
          message: "Section updated successfully",
          color: "green",
        });
        closeEditModal();
      } else {
        throw new Error(data.error || "Failed to update section");
      }
    } catch (error) {
      console.error("Error updating section:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update section",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update display order
  const updateSectionOrder = async (updatedSections) => {
    try {
      const sectionsWithOrder = updatedSections.map((section, index) => ({
        id: section.id,
        display_order: index + 1,
      }));

      const response = await fetch(`${API_BASE_URL}/product-sections/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections: sectionsWithOrder }),
      });

      const data = await response.json();

      if (data.success) {
        notifications.show({
          title: "Success",
          message: "Section order updated successfully",
          color: "green",
        });
      } else {
        throw new Error(data.error || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update section order",
        color: "red",
      });
      // Revert the order on error
      fetchSections();
    }
  };

  // Move section up/down
  const moveSectionUp = (index) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    setSections(newSections);
    updateSectionOrder(newSections);
  };

  const moveSectionDown = (index) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    setSections(newSections);
    updateSectionOrder(newSections);
  };

  // Open edit modal
  const openEdit = (section) => {
    setSelectedSection(section);
    setFormData({
      section_name: section.section_name,
      description: section.description || "",
      is_active: section.is_active,
    });
    openEditModal();
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Stack spacing="xl">
        <Flex justify="space-between" align="center">
          <Title order={2}>Product Sections Management</Title>
          <Button onClick={fetchSections} variant="outline">
            Refresh
          </Button>
        </Flex>

        <Alert>
          <Text size="sm">
            Manage the visibility and order of selected homepage product
            sections. You can enable/disable sections, edit section names, and
            reorder them.
          </Text>
        </Alert>

        <Card>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Order</th>
                <th>Section Name</th>
                <th>Component</th>
                <th>Status</th>
                <th>Description</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section, index) => (
                <tr key={section.id}>
                  <td>
                    <Flex align="center" gap="xs">
                      <Badge variant="outline" size="sm">
                        {section.display_order}
                      </Badge>
                      <Group gap="2">
                        <Tooltip label="Move Up">
                          <ActionIcon
                            variant="subtle"
                            size="xs"
                            disabled={index === 0}
                            onClick={() => moveSectionUp(index)}
                          >
                            <IconArrowUp size={12} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Move Down">
                          <ActionIcon
                            variant="subtle"
                            size="xs"
                            disabled={index === sections.length - 1}
                            onClick={() => moveSectionDown(index)}
                          >
                            <IconArrowDown size={12} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Flex>
                  </td>
                  <td>
                    <Text fw={500}>{section.section_name}</Text>
                    <Text size="xs" c="dimmed">
                      {section.section_key}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm">{section.component_name}</Text>
                  </td>
                  <td>
                    <Switch
                      checked={section.is_active}
                      onChange={() => toggleSectionStatus(section.id)}
                      color="green"
                      thumbIcon={
                        section.is_active ? (
                          <IconEye size={12} />
                        ) : (
                          <IconEyeOff size={12} />
                        )
                      }
                    />
                  </td>
                  <td>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {section.description || "No description"}
                    </Text>
                  </td>
                  <td>
                    <Group gap="xs">
                      <Tooltip label="Edit Section">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => openEdit(section)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Product Section"
        size="md"
      >
        <Stack spacing="md">
          <TextInput
            label="Section Name"
            placeholder="Enter section display name"
            value={formData.section_name}
            onChange={(e) =>
              setFormData({ ...formData, section_name: e.target.value })
            }
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter section description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />

          <Switch
            label="Active Status"
            description="Enable or disable this section"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.currentTarget.checked })
            }
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={updateSection} loading={submitting}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default ProductSectionsManagement;
