import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  FaWallet,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaLock,
  FaUnlock,
  FaHistory,
} from "react-icons/fa";
import axios from "axios";
import supabase from "../../utils/supabase";

const AdminWalletManagement = () => {
  const [walletStats, setWalletStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const isInitialLoad = useRef(true);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showTransactionHistoryModal, setShowTransactionHistoryModal] =
    useState(false);
  const [showAdminRechargeModal, setShowAdminRechargeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [adminWallet, setAdminWallet] = useState(null);

  // Form states
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: 0,
    reason: "",
    userId: "",
  });

  const [freezeForm, setFreezeForm] = useState({
    reason: "",
    userId: "",
    action: "freeze", // "freeze" or "unfreeze"
  });

  const [adminRechargeForm, setAdminRechargeForm] = useState({
    amount: 0,
  });

  const [transferForm, setTransferForm] = useState({
    amount: 0,
    reason: "",
    userId: "",
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

  // Fetch admin wallet details
  const fetchAdminWalletDetails = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/wallet/admin/wallet-details`,
        {
          headers,
        }
      );

      if (response.data.success) {
        setAdminWallet(response.data.wallet);
      }
    } catch (error) {
      console.error("Error fetching admin wallet details:", error);
      if (error.response?.status === 401) {
        showNotification("error", "Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        console.log("Admin wallet endpoint not found - tables may not exist");
        // Set a default wallet state to prevent errors
        setAdminWallet({ balance: 0 });
      } else {
        showNotification(
          "error",
          error.response?.data?.error || "Failed to fetch admin wallet details"
        );
      }
    }
  }, [API_URL, getAuthHeaders]);

  // Fetch wallet statistics
  const fetchWalletStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/wallet/admin/statistics`, {
        headers,
      });

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
  }, [API_URL, getAuthHeaders]);

  // Fetch users with wallet info
  const fetchUsersWithWallets = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: searchQuery,
      });

      // Add status filter if selected
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      // Fetch users with their wallet info from the wallet endpoint
      const response = await axios.get(
        `${API_URL}/wallet/admin/users-with-wallets?${params.toString()}`,
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
  }, [
    API_URL,
    currentPage,
    pageSize,
    searchQuery,
    statusFilter,
    getAuthHeaders,
  ]);

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
        `${API_URL}/wallet/admin/add-money`,
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

  // Handle freeze/unfreeze wallet
  const handleWalletAction = async () => {
    if (!freezeForm.userId || !freezeForm.reason) {
      showNotification("error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const endpoint = freezeForm.action === "freeze" ? "freeze" : "unfreeze";
      const response = await axios.post(
        `${API_URL}/wallet/admin/${endpoint}/${freezeForm.userId}`,
        { reason: freezeForm.reason },
        { headers }
      );

      if (response.data.success) {
        showNotification(
          "success",
          `Wallet ${freezeForm.action}d successfully`
        );
        setShowFreezeModal(false);
        setFreezeForm({ reason: "", userId: "", action: "freeze" });
        fetchUsersWithWallets();
      }
    } catch (error) {
      console.error(`Error ${freezeForm.action}ing wallet:`, error);
      showNotification(
        "error",
        error.response?.data?.error || `Failed to ${freezeForm.action} wallet`
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history for a user
  const fetchTransactionHistory = async (userId) => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/wallet/admin/transactions/${userId}`,
        { headers }
      );

      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      showNotification(
        "error",
        error.response?.data?.error || "Failed to fetch transaction history"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle admin wallet recharge
  const handleAdminWalletRecharge = async () => {
    if (!adminRechargeForm.amount || adminRechargeForm.amount <= 0) {
      showNotification("error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();

      // Create recharge request
      const rechargeResponse = await axios.post(
        `${API_URL}/wallet/admin/wallet-recharge/request`,
        { amount: adminRechargeForm.amount },
        { headers }
      );

      if (!rechargeResponse.data.success) {
        throw new Error(rechargeResponse.data.error);
      }

      const rechargeRequestId = rechargeResponse.data.rechargeRequest.id;

      // Create Razorpay order
      const orderResponse = await axios.post(
        `${API_URL}/wallet/admin/wallet-recharge/create-order`,
        {
          amount: adminRechargeForm.amount,
          rechargeRequestId: rechargeRequestId,
        },
        { headers }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error);
      }

      const { orderId, amount, currency, key } = orderResponse.data;

      // Initialize Razorpay payment
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "Admin Wallet Recharge",
        description: `Recharge admin wallet with ₹${adminRechargeForm.amount}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API_URL}/wallet/admin/wallet-recharge/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                rechargeRequestId: rechargeRequestId,
              },
              { headers }
            );

            if (verifyResponse.data.success) {
              showNotification("success", "Wallet recharged successfully!");
              setShowAdminRechargeModal(false);
              setAdminRechargeForm({ amount: 0 });
              fetchAdminWalletDetails();
              fetchWalletStatistics();
            } else {
              showNotification("error", "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            showNotification("error", "Payment verification failed");
          }
        },
        prefill: {
          name: "Admin",
          email: "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error initiating admin wallet recharge:", error);
      if (error.response?.status === 404) {
        showNotification(
          "error",
          "Admin wallet system not set up. Please contact administrator to create database tables."
        );
      } else {
        showNotification(
          "error",
          error.response?.data?.error || "Failed to initiate wallet recharge"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle transfer money to user
  const handleTransferToUser = async () => {
    if (
      !transferForm.userId ||
      !transferForm.amount ||
      transferForm.amount <= 0
    ) {
      showNotification("error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/wallet/admin/transfer-to-user`,
        {
          userId: transferForm.userId,
          amount: transferForm.amount,
          reason:
            transferForm.reason || `Admin transfer of ₹${transferForm.amount}`,
        },
        { headers }
      );

      if (response.data.success) {
        showNotification("success", "Money transferred successfully");
        setShowTransferModal(false);
        setTransferForm({ amount: 0, reason: "", userId: "" });
        fetchAdminWalletDetails();
        fetchUsersWithWallets();
        fetchWalletStatistics();
      }
    } catch (error) {
      console.error("Error transferring money:", error);
      showNotification(
        "error",
        error.response?.data?.error || "Failed to transfer money"
      );
    } finally {
      setLoading(false);
    }
  };

  // Open freeze modal
  const openFreezeModal = (user, action) => {
    setSelectedUser(user);
    setFreezeForm({
      userId: user.id,
      reason: "",
      action: action,
    });
    setShowFreezeModal(true);
  };

  // Open transaction history modal
  const openTransactionHistoryModal = (user) => {
    setSelectedUser(user);
    setShowTransactionHistoryModal(true);
    fetchTransactionHistory(user.id);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Authentication check on mount only
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          showNotification("error", "Please login to access wallet management");
          return;
        }

        console.log("Token retrieved successfully");
        // Initial data load after authentication
        Promise.all([
          fetchWalletStatistics(),
          fetchUsersWithWallets(),
          fetchAdminWalletDetails(),
        ]).catch((error) => {
          console.error("Error during initial data load:", error);
          showNotification(
            "error",
            "Failed to load wallet data. Please refresh the page."
          );
        });
        isInitialLoad.current = false;
      } catch (error) {
        console.error("Authentication check failed:", error);
        showNotification("error", "Authentication check failed. Please login.");
      }
    };

    checkAuth();
  }, [fetchWalletStatistics, fetchUsersWithWallets, fetchAdminWalletDetails]); // Include dependencies

  // Fetch data when filters change (excluding initial mount)
  useEffect(() => {
    // Skip the first render which is handled by the auth check above
    if (!isInitialLoad.current) {
      fetchUsersWithWallets();
    }
  }, [currentPage, searchQuery, statusFilter, fetchUsersWithWallets]);

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

      {/* Setup Warning - Show if admin wallet is null (indicates tables not created) */}
      {adminWallet === null && (
        <Card
          withBorder
          padding="lg"
          mb="xl"
          style={{ backgroundColor: "#fff3cd", borderColor: "#ffeaa7" }}
        >
          <Stack spacing="md">
            <Group>
              <Text size="lg" weight={600} color="orange">
                ⚠️ Database Setup Required
              </Text>
            </Group>
            <Text size="sm">
              The admin wallet management system requires additional database
              tables to be created in your Supabase project.
            </Text>
            <Text size="sm">
              <strong>Setup Instructions:</strong>
            </Text>
            <ol style={{ margin: 0, paddingLeft: "20px" }}>
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>
                Run the SQL script from <code>ADMIN_WALLET_SETUP.md</code>
              </li>
              <li>Restart the backend server</li>
              <li>Refresh this page</li>
            </ol>
            <Text size="xs" color="dimmed">
              See the ADMIN_WALLET_SETUP.md file in the project root for
              detailed instructions.
            </Text>
          </Stack>
        </Card>
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
            <Stack spacing="xs">
              <Text size="sm" color="dimmed">
                Admin Wallet Balance
              </Text>
              <Text size="xl" weight={700} color="blue">
                {adminWallet ? formatCurrency(adminWallet.balance) : "₹0.00"}
              </Text>
              <Group spacing="xs">
                <Button
                  size="xs"
                  leftSection={<FaPlus />}
                  onClick={() => setShowAdminRechargeModal(true)}
                >
                  Recharge
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setShowTransferModal(true)}
                >
                  Transfer
                </Button>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Quick Actions */}
      <Group mb="md">
        <Button
          leftSection={<FaPlus />}
          onClick={() => setShowAddMoneyModal(true)}
        >
          Add Money to User
        </Button>
        <ActionIcon
          size="lg"
          variant="light"
          onClick={() => {
            fetchWalletStatistics();
            fetchAdminWalletDetails();
            fetchUsersWithWallets();
          }}
          loading={statsLoading}
        >
          <FaSyncAlt />
        </ActionIcon>
      </Group>

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
              <th>Wallet Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  <Loader />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
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
                      color={user.wallet_balance > 0 ? "green" : "red"}
                    >
                      {formatCurrency(user.wallet_balance || 0)}
                    </Text>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <Badge color={user.is_frozen ? "red" : "green"}>
                        {user.is_frozen ? "Frozen" : "Active"}
                      </Badge>
                      {user.is_frozen && user.frozen_reason && (
                        <Text size="xs" color="dimmed">
                          Reason: {user.frozen_reason}
                        </Text>
                      )}
                    </div>
                  </td>
                  <td>
                    <Group spacing="xs">
                      <Tooltip label="Transaction History">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() => openTransactionHistoryModal(user)}
                        >
                          <FaHistory />
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
                      {user.is_frozen ? (
                        <Tooltip label="Unfreeze Wallet">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="orange"
                            onClick={() => openFreezeModal(user, "unfreeze")}
                          >
                            <FaUnlock />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Tooltip label="Freeze Wallet">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            color="red"
                            onClick={() => openFreezeModal(user, "freeze")}
                          >
                            <FaLock />
                          </ActionIcon>
                        </Tooltip>
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
            total={Math.ceil(users.length / pageSize)}
          />
        </Group>
      </Card>

      {/* Add Money Modal */}
      <Modal
        opened={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        title="Add Money to User Wallet"
        size="md"
      >
        <Stack spacing="md">
          {selectedUser && (
            <Card
              withBorder
              padding="sm"
              style={{ backgroundColor: "#e6f7ff" }}
            >
              <Stack spacing="xs">
                <Text size="sm">
                  <strong>User:</strong>{" "}
                  {selectedUser.name || selectedUser.full_name}
                </Text>
                <Text size="sm">
                  <strong>Email:</strong> {selectedUser.email}
                </Text>
                <Text size="sm">
                  <strong>Current Balance:</strong>{" "}
                  {formatCurrency(selectedUser.wallet_balance || 0)}
                </Text>
                <Text size="sm">
                  <strong>Status:</strong>{" "}
                  <Badge color={selectedUser.is_frozen ? "red" : "green"}>
                    {selectedUser.is_frozen ? "Frozen" : "Active"}
                  </Badge>
                </Text>
              </Stack>
            </Card>
          )}

          {selectedUser?.is_frozen && (
            <Card
              withBorder
              padding="sm"
              style={{ backgroundColor: "#fff3cd", borderColor: "#ffeaa7" }}
            >
              <Text size="sm" color="orange">
                <strong>⚠️ Note:</strong> This wallet is currently frozen.
                Adding money will still work, but the user won&apos;t be able to
                use it until unfrozen.
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
            description="Amount will be credited directly to user's wallet"
          />

          {addMoneyForm.amount > 0 && selectedUser && (
            <Card
              withBorder
              padding="xs"
              style={{ backgroundColor: "#f0f9ff" }}
            >
              <Text size="sm" color="blue">
                <strong>New Balance Preview:</strong>{" "}
                {formatCurrency(
                  (selectedUser.wallet_balance || 0) +
                    (addMoneyForm.amount || 0)
                )}
              </Text>
            </Card>
          )}

          <Textarea
            label="Reason"
            placeholder="Enter reason for adding money (e.g., Refund, Bonus, Compensation)..."
            value={addMoneyForm.reason}
            onChange={(e) =>
              setAddMoneyForm({ ...addMoneyForm, reason: e.target.value })
            }
            minRows={3}
            description="This reason will be visible to the user in their transaction history"
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
              leftSection={<FaPlus />}
              color="green"
            >
              Add Money
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Freeze/Unfreeze Wallet Modal */}
      <Modal
        opened={showFreezeModal}
        onClose={() => setShowFreezeModal(false)}
        title={`${
          freezeForm.action === "freeze" ? "Freeze" : "Unfreeze"
        } Wallet`}
        size="md"
      >
        <Stack spacing="md">
          {selectedUser && (
            <Card
              withBorder
              padding="sm"
              style={{
                backgroundColor:
                  freezeForm.action === "freeze" ? "#ffe6e6" : "#e6f7ff",
              }}
            >
              <Stack spacing="xs">
                <Text size="sm">
                  <strong>User:</strong>{" "}
                  {selectedUser.name || selectedUser.full_name}
                </Text>
                <Text size="sm">
                  <strong>Email:</strong> {selectedUser.email}
                </Text>
                <Text size="sm">
                  <strong>Current Balance:</strong>{" "}
                  {formatCurrency(selectedUser.wallet_balance)}
                </Text>
                <Text size="sm">
                  <strong>Current Status:</strong>{" "}
                  <Badge color={selectedUser.is_frozen ? "red" : "green"}>
                    {selectedUser.is_frozen ? "Frozen" : "Active"}
                  </Badge>
                </Text>
                {selectedUser.is_frozen && selectedUser.frozen_reason && (
                  <Text size="sm">
                    <strong>Previous Freeze Reason:</strong>{" "}
                    {selectedUser.frozen_reason}
                  </Text>
                )}
              </Stack>
            </Card>
          )}

          {freezeForm.action === "freeze" && (
            <Card
              withBorder
              padding="sm"
              style={{ backgroundColor: "#fff3cd", borderColor: "#ffeaa7" }}
            >
              <Text size="sm" color="orange">
                <strong>⚠️ Warning:</strong> Freezing this wallet will prevent
                the user from:
              </Text>
              <Text size="xs" mt="xs">
                • Making payments using wallet balance
                <br />
                • Receiving money transfers
                <br />• Requesting wallet recharges
              </Text>
            </Card>
          )}

          <Textarea
            label={`Reason for ${freezeForm.action}ing wallet`}
            placeholder={`Enter detailed reason for ${freezeForm.action}ing this wallet...`}
            value={freezeForm.reason}
            onChange={(e) =>
              setFreezeForm({ ...freezeForm, reason: e.target.value })
            }
            minRows={4}
            required
            description="This reason will be visible to the user and recorded in audit logs"
          />

          <Group position="right">
            <Button variant="outline" onClick={() => setShowFreezeModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWalletAction}
              loading={loading}
              color={freezeForm.action === "freeze" ? "red" : "orange"}
              leftSection={
                freezeForm.action === "freeze" ? <FaLock /> : <FaUnlock />
              }
            >
              {freezeForm.action === "freeze"
                ? "Confirm Freeze"
                : "Confirm Unfreeze"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Transaction History Modal */}
      <Modal
        opened={showTransactionHistoryModal}
        onClose={() => setShowTransactionHistoryModal(false)}
        title={`Transaction History - ${
          selectedUser?.name || selectedUser?.full_name
        }`}
        size="xl"
      >
        <Stack spacing="md">
          {selectedUser && (
            <Card
              withBorder
              padding="sm"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <Group position="apart">
                <div>
                  <Text size="sm">
                    <strong>User:</strong>{" "}
                    {selectedUser.name || selectedUser.full_name}
                  </Text>
                  <Text size="sm">
                    <strong>Email:</strong> {selectedUser.email}
                  </Text>
                  <Text size="sm">
                    <strong>Current Balance:</strong>{" "}
                    {formatCurrency(selectedUser.wallet_balance)}
                  </Text>
                </div>
                <Badge color={selectedUser.is_frozen ? "red" : "green"}>
                  {selectedUser.is_frozen ? "Frozen" : "Active"}
                </Badge>
              </Group>
            </Card>
          )}

          {/* Transaction Filters */}
          <Group>
            <Select
              placeholder="Filter by type"
              data={[
                { value: "", label: "All Types" },
                { value: "credit", label: "Credit" },
                { value: "debit", label: "Debit" },
                { value: "freeze", label: "Freeze" },
                { value: "unfreeze", label: "Unfreeze" },
              ]}
              style={{ minWidth: 150 }}
            />
            <Select
              placeholder="Filter by status"
              data={[
                { value: "", label: "All Status" },
                { value: "completed", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
              style={{ minWidth: 150 }}
            />
          </Group>

          {loading ? (
            <Group position="center" py="xl">
              <Loader />
            </Group>
          ) : transactions.length === 0 ? (
            <Text align="center" color="dimmed" py="xl">
              No transactions found
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <Stack spacing={2}>
                        <Text size="sm" weight={500}>
                          {new Date(transaction.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {new Date(transaction.created_at).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </Stack>
                    </td>
                    <td>
                      <Badge
                        size="sm"
                        color={
                          transaction.transaction_type === "credit"
                            ? "green"
                            : transaction.transaction_type === "debit"
                            ? "red"
                            : transaction.transaction_type === "freeze"
                            ? "red"
                            : transaction.transaction_type === "unfreeze"
                            ? "orange"
                            : "gray"
                        }
                      >
                        {transaction.transaction_type?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Stack spacing={2}>
                        <Text
                          size="sm"
                          weight={500}
                          color={
                            transaction.transaction_type === "credit"
                              ? "green"
                              : transaction.transaction_type === "debit"
                              ? "red"
                              : "dark"
                          }
                        >
                          {transaction.amount && transaction.amount > 0
                            ? `${
                                transaction.transaction_type === "debit"
                                  ? "-"
                                  : "+"
                              }${formatCurrency(transaction.amount)}`
                            : "-"}
                        </Text>
                      </Stack>
                    </td>
                    <td>
                      <Stack spacing={2}>
                        <Text size="xs" color="dimmed">
                          Before: {formatCurrency(transaction.balance_before)}
                        </Text>
                        <Text size="sm" weight={500}>
                          After: {formatCurrency(transaction.balance_after)}
                        </Text>
                      </Stack>
                    </td>
                    <td>
                      <Text
                        size="sm"
                        style={{ maxWidth: 200, wordWrap: "break-word" }}
                      >
                        {transaction.description}
                      </Text>
                    </td>
                    <td>
                      <Stack spacing={2}>
                        {transaction.reference_type && (
                          <Badge variant="outline" size="xs">
                            {transaction.reference_type}
                          </Badge>
                        )}
                        {transaction.reference_id && (
                          <Text size="xs" color="dimmed">
                            ID: {transaction.reference_id}
                          </Text>
                        )}
                        {transaction.admin?.name && (
                          <Text size="xs" color="blue">
                            By: {transaction.admin.name}
                          </Text>
                        )}
                      </Stack>
                    </td>
                    <td>
                      <Badge
                        size="sm"
                        color={
                          transaction.status === "completed"
                            ? "green"
                            : transaction.status === "pending"
                            ? "yellow"
                            : transaction.status === "failed"
                            ? "red"
                            : "gray"
                        }
                      >
                        {transaction.status?.toUpperCase() || "COMPLETED"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination would go here */}
          {transactions.length > 0 && (
            <Group position="center" mt="md">
              <Text size="sm" color="dimmed">
                Showing {transactions.length} transactions
              </Text>
            </Group>
          )}
        </Stack>
      </Modal>

      {/* Admin Wallet Recharge Modal */}
      <Modal
        opened={showAdminRechargeModal}
        onClose={() => setShowAdminRechargeModal(false)}
        title="Recharge Admin Wallet"
        size="md"
      >
        <Stack spacing="md">
          <Card withBorder padding="sm" style={{ backgroundColor: "#f8f9fa" }}>
            <Text size="sm">
              <strong>Current Admin Balance:</strong>{" "}
              {adminWallet ? formatCurrency(adminWallet.balance) : "₹0.00"}
            </Text>
          </Card>

          <NumberInput
            label="Amount to Add"
            placeholder="Enter amount"
            value={adminRechargeForm.amount}
            onChange={(value) =>
              setAdminRechargeForm({ ...adminRechargeForm, amount: value })
            }
            min={1}
            precision={2}
            required
          />

          <Text size="xs" color="dimmed">
            Payment will be processed through Razorpay
          </Text>

          <Group position="right">
            <Button
              variant="outline"
              onClick={() => setShowAdminRechargeModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdminWalletRecharge}
              loading={loading}
              leftSection={<FaWallet />}
            >
              Proceed to Payment
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Transfer Money to User Modal */}
      <Modal
        opened={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Money to User"
        size="md"
      >
        <Stack spacing="md">
          <Card withBorder padding="sm" style={{ backgroundColor: "#f8f9fa" }}>
            <Text size="sm">
              <strong>Admin Wallet Balance:</strong>{" "}
              {adminWallet ? formatCurrency(adminWallet.balance) : "₹0.00"}
            </Text>
          </Card>

          <Select
            label="Select User"
            placeholder="Choose a user"
            value={transferForm.userId}
            onChange={(value) =>
              setTransferForm({ ...transferForm, userId: value })
            }
            data={users.map((user) => ({
              value: user.id,
              label: `${user.name || user.full_name} (${
                user.email
              }) - Balance: ${formatCurrency(user.wallet_balance)}`,
            }))}
            searchable
            required
          />

          <NumberInput
            label="Amount to Transfer"
            placeholder="Enter amount"
            value={transferForm.amount}
            onChange={(value) =>
              setTransferForm({ ...transferForm, amount: value })
            }
            min={1}
            precision={2}
            max={adminWallet?.balance || 0}
            required
          />

          <Textarea
            label="Reason (Optional)"
            placeholder="Enter reason for transfer..."
            value={transferForm.reason}
            onChange={(e) =>
              setTransferForm({ ...transferForm, reason: e.target.value })
            }
            minRows={3}
          />

          <Group position="right">
            <Button
              variant="outline"
              onClick={() => setShowTransferModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransferToUser}
              loading={loading}
              leftSection={<FaPlus />}
              disabled={!adminWallet || adminWallet.balance <= 0}
            >
              Transfer Money
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Legacy Transaction Modal - Keep for backward compatibility */}
      <Modal
        opened={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title={`Transaction History - ${
          selectedUser?.name || selectedUser?.full_name
        }`}
        size="xl"
      >
        <Text>
          This modal can be removed or redirected to the new transaction history
          modal
        </Text>
      </Modal>
    </div>
  );
};

export default AdminWalletManagement;
