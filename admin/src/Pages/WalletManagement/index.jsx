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
  NumberInput,
  Textarea,
  Notification,
  Loader,
  Text,
  Grid,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { FaWallet, FaPlus, FaSearch, FaEye, FaSyncAlt } from "react-icons/fa";
import axios from "axios";
import supabase from "../../utils/supabase";

const AdminWalletManagement = () => {
  const [walletStats, setWalletStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: 0,
    reason: "",
    userId: "",
  });

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Get auth headers using Supabase session
  const getAuthHeaders = useCallback(async () => {
    try {
      // Get fresh session from Supabase
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

      // Log token for debugging (remove in production)
      console.log("Token retrieved successfully");

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

  // Fetch wallet statistics
  const fetchWalletStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/wallet/admin/statistics`,
        { headers }
      );

      if (response.data.success) {
        setWalletStats(response.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching wallet statistics:", error);

      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        showNotification("error", "Authentication failed. Please login again.");
      } else {
        showNotification(
          "error",
          error.response?.data?.error || "Failed to fetch wallet statistics"
        );
      }
    } finally {
      setStatsLoading(false);
    }
  }, [API_BASE_URL, getAuthHeaders]);

  // Fetch users with wallet info
  const fetchUsersWithWallets = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // Fetch users with their wallet info from the wallet endpoint
      const response = await axios.get(
        `${API_BASE_URL}/wallet/admin/users-with-wallets?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        { headers }
      );

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        showNotification("error", "Authentication failed. Please login again.");
      } else {
        showNotification(
          "error",
          error.response?.data?.error || "Failed to fetch users"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, currentPage, pageSize, searchQuery, getAuthHeaders]);

  // Add money to user wallet
  const handleAddMoney = async () => {
    if (
      !addMoneyForm.userId ||
      !addMoneyForm.amount ||
      addMoneyForm.amount <= 0
    ) {
      showNotification("error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/wallet/admin/add-money`,
        {
          userId: addMoneyForm.userId,
          amount: addMoneyForm.amount,
          reason:
            addMoneyForm.reason || `Admin credit of ₹${addMoneyForm.amount}`,
        },
        { headers }
      );

      if (response.data.success) {
        showNotification("success", "Money added successfully");
        setShowAddMoneyModal(false);
        setAddMoneyForm({ amount: 0, reason: "", userId: "" });
        fetchUsersWithWallets();
        fetchWalletStatistics();
      }
    } catch (error) {
      console.error("Error adding money:", error);
      showNotification(
        "error",
        error.response?.data?.error || "Failed to add money"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      suspended: "yellow",
      frozen: "red",
      pending: "yellow",
      completed: "green",
      failed: "red",
      cancelled: "gray",
    };
    return colors[status] || "gray";
  };

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          showNotification("error", "Please login to access wallet management");
          return;
        }

        // User is authenticated, fetch data
        fetchWalletStatistics();
        fetchUsersWithWallets();
      } catch (error) {
        console.error("Authentication check failed:", error);
        showNotification("error", "Authentication check failed. Please login.");
      }
    };

    checkAuth();
  }, [
    currentPage,
    searchQuery,
    statusFilter,
    fetchWalletStatistics,
    fetchUsersWithWallets,
  ]);

  return (
    <div style={{ padding: "20px" }}>
      {/* Notification */}
      {notification.show && (
        <Notification
          color={notification.type === "error" ? "red" : "green"}
          onClose={() => setNotification({ ...notification, show: false })}
          style={{ marginBottom: "20px" }}
        >
          {notification.message}
        </Notification>
      )}

      <Title order={2} mb="lg">
        <Group>
          <FaWallet />
          Wallet Management
        </Group>
      </Title>

      {/* Statistics Cards */}
      <Grid mb="xl">
        <Grid.Col span={3}>
          <Card withBorder padding="lg">
            <Stack spacing="xs">
              <Text size="sm" color="dimmed">
                Total Wallets
              </Text>
              <Text size="xl" weight={700}>
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  walletStats?.totalWallets || 0
                )}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card withBorder padding="lg">
            <Stack spacing="xs">
              <Text size="sm" color="dimmed">
                Total Balance
              </Text>
              <Text size="xl" weight={700} color="green">
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  formatCurrency(walletStats?.totalBalance)
                )}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card withBorder padding="lg">
            <Stack spacing="xs">
              <Text size="sm" color="dimmed">
                Total Transactions
              </Text>
              <Text size="xl" weight={700}>
                {statsLoading ? (
                  <Loader size="sm" />
                ) : (
                  walletStats?.totalTransactions || 0
                )}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card withBorder padding="lg">
            <Group position="apart">
              <Stack spacing="xs">
                <Text size="sm" color="dimmed">
                  Actions
                </Text>
                <Button
                  size="sm"
                  leftIcon={<FaPlus />}
                  onClick={() => setShowAddMoneyModal(true)}
                >
                  Add Money
                </Button>
              </Stack>
              <ActionIcon
                size="lg"
                variant="light"
                onClick={fetchWalletStatistics}
                loading={statsLoading}
              >
                <FaSyncAlt />
              </ActionIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* User Wallets Table */}
      <Card withBorder padding="lg" mb="xl">
        <Title order={4} mb="md">
          User Wallets
        </Title>

        <Group mb="md">
          <TextInput
            placeholder="Search users..."
            icon={<FaSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "frozen", label: "Frozen" },
            ]}
            style={{ minWidth: 150 }}
          />
        </Group>

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Total Recharged</th>
              <th>Total Spent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  <Loader />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || user.full_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Text
                      weight={600}
                      color={user.wallet?.balance > 0 ? "green" : "red"}
                    >
                      {formatCurrency(user.wallet?.balance)}
                    </Text>
                  </td>
                  <td>{formatCurrency(user.wallet?.total_recharged)}</td>
                  <td>{formatCurrency(user.wallet?.total_spent)}</td>
                  <td>
                    <Badge color={getStatusColor(user.wallet?.status)}>
                      {user.wallet?.status || "Unknown"}
                    </Badge>
                  </td>
                  <td>
                    <Group spacing="xs">
                      <Tooltip label="View Transactions">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowTransactionModal(true);
                          }}
                        >
                          <FaEye />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Add Money">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="green"
                          onClick={() => {
                            setAddMoneyForm({
                              ...addMoneyForm,
                              userId: user.id,
                            });
                            setSelectedUser(user);
                            setShowAddMoneyModal(true);
                          }}
                        >
                          <FaPlus />
                        </ActionIcon>
                      </Tooltip>
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
            total={Math.ceil(users.length / pageSize)}
          />
        </Group>
      </Card>

      {/* Add Money Modal */}
      <Modal
        opened={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        title="Add Money to Wallet"
        size="md"
      >
        <Stack spacing="md">
          {selectedUser && (
            <Card
              withBorder
              padding="sm"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <Text size="sm">
                <strong>User:</strong>{" "}
                {selectedUser.name || selectedUser.full_name}
              </Text>
              <Text size="sm">
                <strong>Email:</strong> {selectedUser.email}
              </Text>
              <Text size="sm">
                <strong>Current Balance:</strong>{" "}
                {formatCurrency(selectedUser.wallet?.balance)}
              </Text>
            </Card>
          )}

          <NumberInput
            label="Amount to Add"
            placeholder="Enter amount"
            value={addMoneyForm.amount}
            onChange={(value) =>
              setAddMoneyForm({ ...addMoneyForm, amount: value })
            }
            min={1}
            precision={2}
            required
          />

          <Textarea
            label="Reason"
            placeholder="Enter reason for adding money..."
            value={addMoneyForm.reason}
            onChange={(e) =>
              setAddMoneyForm({ ...addMoneyForm, reason: e.target.value })
            }
            minRows={3}
          />

          <Group position="right">
            <Button
              variant="outline"
              onClick={() => setShowAddMoneyModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMoney}
              loading={loading}
              leftIcon={<FaPlus />}
            >
              Add Money
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Transaction History Modal */}
      <Modal
        opened={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title={`Transaction History - ${
          selectedUser?.name || selectedUser?.full_name
        }`}
        size="xl"
      >
        <Text>Transaction history functionality can be implemented here</Text>
      </Modal>
    </div>
  );
};

export default AdminWalletManagement;
