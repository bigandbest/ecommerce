import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Group,
  Button,
  Table,
  Badge,
  Pagination,
  TextInput,
  Select,
  Modal,
  Textarea,
  Notification,
  Loader,
  Text,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  FaMoneyBillAlt,
  FaSearch,
  FaEye,
  FaSyncAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import supabase from "../../utils/supabase";

const AdminRefundManagement = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refundTypeFilter, setRefundTypeFilter] = useState("");

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);

  // Form states
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
  });

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const API_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Get auth headers using Supabase session
  const getAuthHeaders = useCallback(async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to get session");
      }

      const token = session?.access_token;

      if (!token) {
        console.error("No access token found in session");
        throw new Error("No access token found. Please login again.");
      }

      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("Error getting auth headers:", error);
      showNotification(
        "error",
        error.message || "Authentication error. Please login again."
      );
      throw error;
    }
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "success", message: "" });
    }, 5000);
  };

  // Fetch refund requests
  const fetchRefundRequests = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (statusFilter) params.append("status", statusFilter);
      if (refundTypeFilter) params.append("refundType", refundTypeFilter);

      const response = await axios.get(
        `${API_URL}/refund/admin/all?${params}`,
        { headers }
      );

      if (response.data.success) {
        setRefundRequests(response.data.refundRequests);
      }
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      showNotification(
        "error",
        error.response?.data?.error || "Failed to fetch refund requests"
      );
    } finally {
      setLoading(false);
    }
  }, [
    API_URL,
    currentPage,
    pageSize,
    statusFilter,
    refundTypeFilter,
    getAuthHeaders,
  ]);

  // Update refund request status
  const handleUpdateStatus = async () => {
    if (!updateForm.status) {
      showNotification("error", "Please select a status");
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.put(
        `${API_URL}/refund/admin/update-status/${selectedRefund.id}`,
        {
          status: updateForm.status,
          adminNotes: updateForm.adminNotes,
        },
        { headers }
      );

      if (response.data.success) {
        showNotification("success", "Refund request updated successfully");
        setShowUpdateModal(false);
        setUpdateForm({ status: "", adminNotes: "" });
        fetchRefundRequests();
      }
    } catch (error) {
      console.error("Error updating refund request:", error);
      showNotification(
        "error",
        error.response?.data?.error || "Failed to update refund request"
      );
    } finally {
      setLoading(false);
    }
  };

  // Open update modal
  const openUpdateModal = (refund) => {
    setSelectedRefund(refund);
    setUpdateForm({
      status: refund.status,
      adminNotes: refund.admin_notes || "",
    });
    setShowUpdateModal(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      approved: "blue",
      processing: "orange",
      completed: "green",
      rejected: "red",
    };
    return colors[status] || "gray";
  };

  // Get refund type badge color
  const getRefundTypeColor = (type) => {
    const colors = {
      order_cancellation: "red",
      order_return: "orange",
      partial_refund: "blue",
    };
    return colors[type] || "gray";
  };

  useEffect(() => {
    fetchRefundRequests();
  }, [fetchRefundRequests]);

  return (
    <div>
      <Group position="apart" mb="md">
        <Title order={2}>
          <FaMoneyBillAlt style={{ marginRight: "8px" }} />
          Refund Management
        </Title>
        <Button leftSection={<FaSyncAlt />} onClick={fetchRefundRequests}>
          Refresh
        </Button>
      </Group>

      {notification.show && (
        <Notification
          color={notification.type === "error" ? "red" : "green"}
          onClose={() =>
            setNotification({ show: false, type: "success", message: "" })
          }
          mb="md"
        >
          {notification.message}
        </Notification>
      )}

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="md">
          <TextInput
            placeholder="Search by user name, email, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<FaSearch />}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "processing", label: "Processing" },
              { value: "completed", label: "Completed" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
          <Select
            placeholder="Filter by type"
            value={refundTypeFilter}
            onChange={setRefundTypeFilter}
            data={[
              { value: "", label: "All Types" },
              { value: "order_cancellation", label: "Order Cancellation" },
              { value: "order_return", label: "Order Return" },
              { value: "partial_refund", label: "Partial Refund" },
            ]}
          />
        </Group>

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Order ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Payment Method</th>
              <th>Refund Mode</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  <Loader />
                </td>
              </tr>
            ) : refundRequests.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No refund requests found
                </td>
              </tr>
            ) : (
              refundRequests.map((refund) => (
                <tr key={refund.id}>
                  <td>
                    <Text size="sm" weight={500}>
                      #{refund.id.slice(-8)}
                    </Text>
                  </td>
                  <td>
                    <Text size="sm">
                      #
                      {refund.order?.id?.slice(-8) ||
                        refund.order_id?.slice(-8)}
                    </Text>
                  </td>
                  <td>
                    <div>
                      <Text size="sm" weight={500}>
                        {refund.user?.name}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {refund.user?.email}
                      </Text>
                    </div>
                  </td>
                  <td>
                    <Text weight={600} color="green">
                      {formatCurrency(refund.refund_amount)}
                    </Text>
                  </td>
                  <td>
                    <Badge
                      color={getRefundTypeColor(refund.refund_type)}
                      size="sm"
                    >
                      {refund.refund_type.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant="outline" size="sm">
                      {refund.payment_method.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant="light" size="sm">
                      {refund.refund_mode.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={getStatusColor(refund.status)} size="sm">
                      {refund.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <Text size="xs">
                      {new Date(refund.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </td>
                  <td>
                    <Group spacing="xs">
                      <Tooltip label="Update Status">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() => openUpdateModal(refund)}
                        >
                          <FaEye />
                        </ActionIcon>
                      </Tooltip>
                      {refund.status === "pending" && (
                        <>
                          <Tooltip label="Quick Approve">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="green"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setUpdateForm({
                                  status: "approved",
                                  adminNotes: "Quick approved by admin",
                                });
                                handleUpdateStatus();
                              }}
                            >
                              <FaCheck />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Quick Reject">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setUpdateForm({
                                  status: "rejected",
                                  adminNotes: "Quick rejected by admin",
                                });
                                handleUpdateStatus();
                              }}
                            >
                              <FaTimes />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      )}
                    </Group>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Group position="center" mt="md">
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={Math.ceil(refundRequests.length / pageSize)}
          />
        </Group>
      </Card>

      {/* Update Status Modal */}
      <Modal
        opened={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title={`Update Refund Request - #${selectedRefund?.id?.slice(-8)}`}
        size="md"
      >
        <Stack spacing="md">
          {selectedRefund && (
            <div>
              <Text size="sm" color="dimmed" mb="xs">
                Order: #{selectedRefund.order?.id?.slice(-8)} | User:{" "}
                {selectedRefund.user?.name} | Amount:{" "}
                {formatCurrency(selectedRefund.refund_amount)}
              </Text>

              <Select
                label="Status"
                value={updateForm.status}
                onChange={(value) =>
                  setUpdateForm({ ...updateForm, status: value })
                }
                data={[
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "processing", label: "Processing" },
                  { value: "completed", label: "Completed" },
                  { value: "rejected", label: "Rejected" },
                ]}
                required
              />

              <Textarea
                label="Admin Notes"
                placeholder="Enter notes about this status update..."
                value={updateForm.adminNotes}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, adminNotes: e.target.value })
                }
                minRows={3}
              />

              {selectedRefund.bank_account_number && (
                <Card withBorder padding="sm" bg="gray.0">
                  <Text size="sm" weight={500} mb="xs">
                    Bank Details:
                  </Text>
                  <Text size="xs">
                    Account: {selectedRefund.bank_account_number}
                  </Text>
                  <Text size="xs">IFSC: {selectedRefund.bank_ifsc_code}</Text>
                  <Text size="xs">Bank: {selectedRefund.bank_name}</Text>
                  <Text size="xs">
                    Holder: {selectedRefund.bank_account_holder_name}
                  </Text>
                </Card>
              )}
            </div>
          )}

          <Group position="right">
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} loading={loading}>
              Update Status
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default AdminRefundManagement;
