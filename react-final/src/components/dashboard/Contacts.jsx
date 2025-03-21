import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Drawer,
  Tag,
  Menu,
  Layout,
  Avatar,
  Badge,
  Select,
  Alert,
  Upload,
  message,
  Switch,
  Card,
  Row,
  Col,
  Pagination,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  BarsOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  BellOutlined,
  UploadOutlined,
  UserOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  MoonOutlined,
  SunOutlined,
  EllipsisOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import API from "../../api/api";
import "../../App.css";
import { useNavigate, useLocation } from "react-router-dom";
import kuramaImage from "../../assets/Kurama.jpg";
import Cookies from "js-cookie";

import { useContactManagement } from "../../hooks/useContactManagement";
import {
  getStatusColor,
  statusOptions,
  filterContacts,
  paginateContacts,
} from "../../utils/contactUtils";
const { Sider, Content, Header } = Layout;
const { Meta } = Card;

const CustomSearchInput = ({ darkMode, ...props }) => {
  return (
    <span
      className={darkMode ? "dark-input-wrapper" : "light-input-wrapper"}
      style={{ position: "relative", display: "inline-block", width: "100%" }}
    >
      <Input {...props} />
      <style jsx="true">{`
        .${darkMode ? "dark-input-wrapper" : "light-input-wrapper"} .ant-input {
          color: ${darkMode ? "#ffffff" : "#000000"} !important;
        }
        .${darkMode ? "dark-input-wrapper" : "light-input-wrapper"}
          .ant-input::placeholder {
          color: ${darkMode
            ? "rgba(255,255,255,0.5)"
            : "rgba(0,0,0,0.5)"} !important;
        }
      `}</style>
    </span>
  );
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
const Contacts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    contacts,
    loading,
    alertState,
    addContact,
    updateContact,
    deleteContact,
    hideAlert,
  } = useContactManagement();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState(
    location.pathname === "/list-patients" ? "grid" : "list"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState(null);
  const [editFileName, setEditFileName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const pageSize = 12;

  const debouncedSearchTerm = useDebounce(searchInput, 3000);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    window.dispatchEvent(new Event("themeChange"));
  }, [darkMode]);

  const handleThemeToggle = (checked) => {
    setDarkMode(checked);
  };

  const showModal = () => setIsModalVisible(true);

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) message.error("Bạn chỉ có thể tải lên file JPG/PNG!");

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error("Hình ảnh phải nhỏ hơn 2MB!");

    return isJpgOrPng && isLt2M;
  };

  const handleImageChange = (info) => {
    if (info.file.status === "uploading") return;

    if (info.file.status === "done") {
      const fileName = info.file.name;
      setFileName(fileName);
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
        message.success(`Hình ảnh "${fileName}" đã tải lên thành công!`);
      });
    } else if (info.file.status === "error") {
      message.error(`Tải lên file ${info.file.name} thất bại.`);
    }
  };

  const handleEditImageChange = (info) => {
    if (info.file.status === "uploading") return;
    if (info.file.status === "done") {
      const fileName = info.file.name;
      setEditFileName(fileName);
      getBase64(info.file.originFileObj, (url) => {
        setEditImageUrl(url);
        message.success(`Image "${fileName}" uploaded successfully!`);
      });
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleAddContact = () => {
    setIsAddLoading(true);
    message.loading({
      content: "Đang kiểm tra thông tin...",
      key: "addContact",
    });

    form
      .validateFields()
      .then(async (values) => {
        try {
          console.log("Form values:", values);

          message.loading({
            content: "Đang thêm liên hệ...",
            key: "addContact",
          });

          const newContact = {
            ...values,
            avatar: imageUrl || `https://i.pravatar.cc/150?img=${Date.now()}`,
            status: values.status || "Active",
            fileName: fileName && imageUrl ? fileName : undefined,
          };

          console.log("Thêm liên hệ mới:", newContact);

          const savedContact = await addContact(newContact);
          console.log("Kết quả:", savedContact);

          if (savedContact) {
            // Đóng modal và reset form
            setIsModalVisible(false);
            form.resetFields();
            setImageUrl(null);
            setFileName("");

            message.success({
              content: "Thêm liên hệ thành công!",
              key: "addContact",
              duration: 3,
            });

            setCurrentPage(1);
          } else {
            throw new Error("Không thể thêm liên hệ");
          }
        } catch (error) {
          console.error("Lỗi khi thêm liên hệ:", error);
          message.error({
            content:
              "Lỗi khi thêm liên hệ: " + (error.message || "Không xác định"),
            key: "addContact",
            duration: 5,
          });
        } finally {
          setIsAddLoading(false);
        }
      })
      .catch((errorInfo) => {
        console.error("Lỗi xác thực form:", errorInfo);
        message.error({
          content: "Vui lòng kiểm tra lại thông tin!",
          key: "addContact",
          duration: 3,
        });

        const errorFields = errorInfo.errorFields || [];
        if (errorFields.length > 0) {
          const fieldNames = errorFields
            .map((field) => field.name[0])
            .join(", ");
          message.warning(`Các trường cần điền: ${fieldNames}`);
        }
        setIsAddLoading(false);
      });
  };

  const showDrawer = (contact) => {
    setSelectedContact(contact);
    setIsDrawerVisible(true);
    setEditImageUrl(null);
    setEditFileName("");
    if (contact) {
      editForm.setFieldsValue({
        name: contact.name,
        email: contact.email,
        company: contact.company,
        title: contact.title,
        status: contact.status,
        phone: contact.phone || "",
        timezone: contact.timezone || "UTC (Coordinated Universal Time)",
      });
    }
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setSelectedContact(null);
    setIsEditing(false);
    setEditImageUrl(null);
    setEditFileName("");
  };

  const handleEdit = () => setIsEditing(true);

  const handleUpdateContact = () => {
    console.log("Bắt đầu cập nhật liên hệ...");
    setIsUpdateLoading(true);

    editForm
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        console.log("Edit image URL:", editImageUrl);

        message.loading({
          content: "Đang cập nhật liên hệ...",
          key: "updateContact",
        });

        const updatedContact = {
          ...selectedContact,
          ...values,
          avatar: editImageUrl || selectedContact.avatar,
          id: selectedContact.id,
          fileName: editFileName || selectedContact.fileName,
        };

        console.log("Contact sau khi cập nhật:", updatedContact);

        return updateContact(updatedContact)
          .then((savedContact) => {
            console.log("Kết quả từ API:", savedContact);

            setSelectedContact(updatedContact);

            message.success({
              content: "Cập nhật liên hệ thành công!",
              key: "updateContact",
              duration: 2,
            });

            setIsUpdateLoading(false);
            closeDrawer();
          })
          .catch((error) => {
            console.error("Lỗi khi cập nhật liên hệ:", error);

            message.error({
              content:
                "Lỗi khi cập nhật liên hệ: " +
                (error.message || "Không xác định"),
              key: "updateContact",
              duration: 3,
            });

            setIsUpdateLoading(false);
            throw error;
          });
      })
      .catch((errorInfo) => {
        console.error("Lỗi xác thực form:", errorInfo);

        message.error({
          content: "Vui lòng kiểm tra lại thông tin!",
          key: "updateContact",
          duration: 3,
        });

        const errorFields = errorInfo.errorFields || [];
        if (errorFields.length > 0) {
          const fieldNames = errorFields
            .map((field) => field.name[0])
            .join(", ");
          message.warning(`Các trường cần điền: ${fieldNames}`);
        }
        setIsUpdateLoading(false);
      });
  };

  const handleCancelEdit = () => {
    if (isUpdateLoading) return;

    setIsEditing(false);
    setEditImageUrl(null);
    setEditFileName("");
    if (selectedContact) {
      editForm.setFieldsValue({
        name: selectedContact.name,
        email: selectedContact.email,
        company: selectedContact.company,
        title: selectedContact.title,
        status: selectedContact.status,
        phone: selectedContact.phone || "",
        timezone:
          selectedContact.timezone || "UTC (Coordinated Universal Time)",
      });
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    navigate(mode === "grid" ? "/list-patients" : "/dashboard");
  };

  const handleLogout = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== "registered_user" && key !== "contacts") {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();

    Cookies.remove("user_logged_in", { path: "/" });

    navigate("/login");
  };

  const filteredContacts = filterContacts(contacts, searchTerm);
  const paginatedContacts = paginateContacts(
    filteredContacts,
    currentPage,
    pageSize
  );

  const renderTableView = () => (
    <div className="!flex !flex-col !pb-6">
      <div
        className={`!flex !justify-between !items-center !py-3 !px-4 !mb-2 ${
          darkMode
            ? "!bg-gray-800 !border-gray-700"
            : "!bg-blue-50 !border-blue-200"
        } !rounded-lg !shadow-sm !border !border-solid`}
      >
        <div
          className={`${darkMode ? "!text-white" : "!text-black"} !font-medium`}
        >
          Hiển thị 12 kết quả mỗi trang
        </div>
        <Pagination
          current={currentPage}
          onChange={setCurrentPage}
          total={filteredContacts.length}
          pageSize={pageSize}
          showSizeChanger={false}
          showTotal={(total) => `Tổng ${total} contacts`}
          showQuickJumper={true}
          className={`${
            darkMode ? "!text-white" : "!text-black"
          } !font-medium !visible !flex !ml-auto !text-lg pagination-enhanced`}
          size="large"
        />
      </div>

      <Table
        columns={[
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (name, record) => (
              <div className="!flex !items-center !gap-3">
                <Avatar src={record.avatar} size={32} />
                <span className={darkMode ? "!text-white" : "!text-black"}>
                  {name}
                </span>
              </div>
            ),
          },
          {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => (
              <span className={darkMode ? "!text-white" : "!text-black"}>
                {email}
              </span>
            ),
          },
          {
            title: "Company",
            dataIndex: "company",
            key: "company",
            render: (company) => (
              <span className={darkMode ? "!text-white" : "!text-black"}>
                {company}
              </span>
            ),
          },
          {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (title) => (
              <span className={darkMode ? "!text-white" : "!text-black"}>
                {title}
              </span>
            ),
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
              <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <div className="!flex !items-center !gap-2">
                <Button
                  icon={<EyeOutlined className="!text-white" />}
                  onClick={() => showDrawer(record)}
                  className="!bg-blue-500 !border-blue-500 !text-white hover:!bg-blue-600 hover:!border-blue-600 !flex !items-center !justify-center !h-8 !w-8 !rounded !p-0"
                />
                <Popconfirm
                  title={
                    <div>
                      <span className="!flex !items-center !text-black">
                        <span className="!text-yellow-500 !mr-2">⚠️</span>
                        Delete the task
                      </span>
                    </div>
                  }
                  description={
                    <span className="!text-black">
                      Are you sure to delete this contact?
                    </span>
                  }
                  onConfirm={() => deleteContact(record.id)}
                  okText="Yes"
                  cancelText="No"
                  overlayClassName="custom-popconfirm"
                >
                  <Button
                    icon={<DeleteOutlined className="!text-white" />}
                    className="!bg-red-500 !border-red-500 !text-white hover:!bg-red-600 hover:!border-red-600 !flex !items-center !justify-center !h-8 !w-8 !rounded !p-0"
                  />
                </Popconfirm>
              </div>
            ),
          },
        ]}
        dataSource={paginatedContacts}
        pagination={false}
        className={`${
          darkMode
            ? "dark-table !bg-gray-900 !rounded-lg !shadow-sm !border !border-solid !border-gray-700"
            : "!bg-white !rounded-lg !shadow-sm !border !border-solid !border-gray-200"
        }`}
        rowClassName={() =>
          darkMode
            ? "!bg-gray-800 !text-white !border-gray-700"
            : "!bg-white !text-black"
        }
      />
    </div>
  );
  const renderGridView = () => (
    <div className="!flex !flex-col !gap-6 !pb-8">
      <div
        className={`!sticky !top-0 !z-10 !flex !justify-between !items-center !py-3 !px-4 ${
          darkMode
            ? "!bg-gray-800 !border-gray-700"
            : "!bg-blue-50 !border-blue-200"
        } !rounded-lg !shadow-sm !border !border-solid`}
      >
        <div
          className={`${darkMode ? "!text-white" : "!text-black"} !font-medium`}
        >
          Hiển thị 12 kết quả mỗi trang
        </div>
        <Pagination
          current={currentPage}
          onChange={setCurrentPage}
          total={filteredContacts.length}
          pageSize={pageSize}
          showSizeChanger={false}
          showTotal={(total) => `Tổng ${total} contacts`}
          showQuickJumper={true}
          className={`${
            darkMode ? "!text-white" : "!text-black"
          } !font-medium !visible !flex !ml-auto !text-lg pagination-enhanced`}
          size="large"
        />
      </div>

      <div className="!overflow-y-auto">
        <Row gutter={[16, 16]}>
          {paginatedContacts.length > 0 ? (
            paginatedContacts.map((contact) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={contact.id}
                className="!mb-4"
              >
                <Card
                  hoverable
                  className={`!overflow-hidden !rounded-lg ${
                    darkMode
                      ? "!bg-black !border-r-4 !border-solid !border-white !text-white dark-mode-card"
                      : "!bg-white !border !border-solid !border-gray-200 !shadow-sm"
                  }`}
                  bodyStyle={{
                    padding: "20px",
                    backgroundColor: darkMode ? "#000000" : "#ffffff",
                  }}
                >
                  <div
                    className={`!flex !items-start ${
                      darkMode ? "!bg-black" : ""
                    }`}
                  >
                    <Avatar
                      src={contact.avatar}
                      size={60}
                      className={`!mr-4 ${
                        darkMode ? "!border-2 !border-solid !border-white" : ""
                      }`}
                    />
                    <div className="!flex-1 !min-w-0">
                      <div className="!flex !justify-between !items-start">
                        <div className="!pr-2 !overflow-hidden">
                          <div
                            className={`!text-base !font-semibold !mb-1 !truncate ${
                              darkMode ? "!text-white" : "!text-black"
                            }`}
                          >
                            {contact.name}
                          </div>
                          <div
                            className={`!text-sm !mb-2 !truncate ${
                              darkMode ? "!text-gray-300" : "!text-gray-800"
                            }`}
                          >
                            {contact.email}
                          </div>
                        </div>
                        <Tag color={getStatusColor(contact.status)}>
                          {contact.status}
                        </Tag>
                      </div>
                      <div
                        className={`!text-sm !font-medium !mt-1 !truncate ${
                          darkMode ? "!text-gray-300" : "!text-gray-900"
                        }`}
                      >
                        {contact.title}
                      </div>
                      <div
                        className={`!text-xs !mt-1 !mb-3 !truncate ${
                          darkMode ? "!text-gray-400" : "!text-gray-800"
                        }`}
                      >
                        <span className="!inline-flex !items-center">
                          <Avatar
                            size={16}
                            src={`https://logo.clearbit.com/${contact.company
                              ?.toLowerCase()
                              .replace(/[^a-zA-Z0-9]/g, "")}.com`}
                            className="!mr-1"
                          />
                          {contact.company}
                        </span>
                      </div>
                      <div
                        className={`!flex !justify-end !space-x-3 !mt-3 !pt-2 !border-t ${
                          darkMode ? "!border-gray-700" : "!border-gray-200"
                        }`}
                      >
                        <Button
                          icon={<EyeOutlined className="!text-white" />}
                          onClick={() => showDrawer(contact)}
                          className="!bg-blue-500 !border-blue-500 !text-white hover:!bg-blue-600 hover:!border-blue-600 !flex !items-center !justify-center !h-8 !w-8 !rounded !p-0"
                        />
                        <Popconfirm
                          title={
                            <div>
                              <span className="!flex !items-center !text-black">
                                <span className="!text-yellow-500 !mr-2">
                                  ⚠️
                                </span>
                                Delete the task
                              </span>
                            </div>
                          }
                          description={
                            <span className="!text-black">
                              Are you sure to delete this contact?
                            </span>
                          }
                          onConfirm={() => deleteContact(contact.id)}
                          okText="Yes"
                          cancelText="No"
                          overlayClassName="custom-popconfirm"
                        >
                          <Button
                            icon={<DeleteOutlined className="!text-white" />}
                            className="!bg-red-500 !border-red-500 !text-white hover:!bg-red-600 hover:!border-red-600 !flex !items-center !justify-center !h-8 !w-8 !rounded !p-0"
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <div
              className={`!text-center !w-full ${
                darkMode ? "!text-white" : "!text-black"
              }`}
            >
              No contacts found.
            </div>
          )}
        </Row>
      </div>
    </div>
  );

  return (
    <Layout
      className={`!min-h-screen ${darkMode ? "dark-theme" : "light-theme"}`}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className={darkMode ? "" : "light-sidebar"}
        theme={darkMode ? "dark" : "light"}
      >
        <div
          className={`!logo !flex !items-center !justify-center !mt-5 ${
            darkMode ? "" : "!bg-white"
          }`}
        >
          <span
            className={`!font-bold !text-lg !mt-1 !mb-6 ${
              darkMode ? "!text-white" : "!text-black"
            }`}
          >
            VTC Academy
          </span>
        </div>
        <Menu
          theme={darkMode ? "dark" : "light"}
          mode="inline"
          defaultSelectedKeys={
            viewMode === "list" ? ["dashboard"] : ["list-patients"]
          }
          onClick={(e) => {
            if (e.key === "dashboard") handleViewModeChange("list");
            else if (e.key === "list-patients") handleViewModeChange("grid");
            else if (e.key === "logout") handleLogout();
          }}
        >
          <Menu.Item key="dashboard" icon={<BarsOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="list-patients" icon={<AppstoreOutlined />}>
            List Clients
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout className="!site-layout">
        <Header
          className={`!p-4 !flex !items-center !justify-between ${
            darkMode ? "!bg-[#1f1f1f] !text-white" : "!bg-white !text-black"
          }`}
        >
          <div className="!flex !items-center !gap-4">
            <CustomSearchInput
              darkMode={darkMode}
              prefix={
                <SearchOutlined
                  className={darkMode ? "!text-gray-400" : "!text-gray-600"}
                />
              }
              placeholder="Search contacts"
              value={searchInput}
              onChange={handleSearchInputChange}
              className={`!w-64 !px-4 !py-2 !rounded-lg !border ${
                darkMode
                  ? "!bg-gray-800 !border-gray-700"
                  : "!bg-white !border-gray-200"
              }`}
              style={{
                color: darkMode ? "#ffffff" : "#000000",
                caretColor: darkMode ? "#ffffff" : "#000000",
              }}
              suffix={
                searchInput !== searchTerm ? (
                  <div className="!animate-pulse !w-2 !h-2 !rounded-full !bg-blue-500"></div>
                ) : null
              }
            />
            <div className="!flex !items-center !gap-2">
              <Tooltip title="Grid View">
                <Button
                  type={viewMode === "list" ? "default" : "primary"}
                  icon={<AppstoreOutlined />}
                  onClick={() => handleViewModeChange("grid")}
                  className={darkMode ? "!border-gray-700" : ""}
                />
              </Tooltip>
              <Tooltip title="List View">
                <Button
                  type={viewMode === "list" ? "primary" : "default"}
                  icon={<UnorderedListOutlined />}
                  onClick={() => handleViewModeChange("list")}
                  className={darkMode ? "!border-gray-700" : ""}
                />
              </Tooltip>
            </div>
          </div>

          <div className="!flex !items-center !gap-4">
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              checked={darkMode}
              onChange={handleThemeToggle}
              className={darkMode ? "!bg-blue-600" : "!bg-gray-400"}
            />
            <Badge count={2}>
              <Button
                type="text"
                icon={
                  <BellOutlined
                    className={darkMode ? "!text-white" : "!text-black"}
                  />
                }
                className={
                  darkMode ? "!border-gray-700 hover:!bg-gray-800" : ""
                }
              />
            </Badge>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
              className={`${
                darkMode ? "!border-gray-700" : ""
              } !px-4 !h-9 !flex !items-center`}
            >
              Add Contact
            </Button>
            <Avatar size={40} src={kuramaImage} className="!cursor-pointer" />
          </div>
        </Header>

        <Content
          className={`!m-4 !flex !flex-col !overflow-auto !h-[calc(100vh-64px)] ${
            darkMode ? "!bg-[#121212] !text-white" : "!bg-gray-100 !text-black"
          }`}
        >
          {alertState.visible && (
            <Alert
              message={alertState.message}
              type={alertState.type}
              showIcon
              closable
              onClose={hideAlert}
              className="!mb-4"
            />
          )}

          {loading ? (
            <div
              className={`!flex !justify-center !items-center !h-full ${
                darkMode ? "!text-white" : "!text-black"
              }`}
            >
              <div className="!flex !flex-col !items-center !gap-3">
                <div className="!animate-spin !h-8 !w-8 !border-4 !border-blue-500 !rounded-full !border-t-transparent"></div>
                <p>Loading contacts...</p>
                <p className="!text-sm !text-gray-400">
                  This might take a few moments
                </p>
              </div>
            </div>
          ) : viewMode === "list" ? (
            renderTableView()
          ) : (
            renderGridView()
          )}

          <Modal
            title={<span className="!text-black">Add New Contact</span>}
            open={isModalVisible}
            onOk={handleAddContact}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
              setImageUrl(null);
              setFileName("");
            }}
            width={450}
            className="light-modal"
            footer={
              <div className="!flex !justify-end !gap-3 !py-2 !bg-white">
                <Button
                  key="cancel"
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setImageUrl(null);
                    setFileName("");
                  }}
                  className="!px-3 !py-1 !h-auto !min-w-[80px]"
                  disabled={isAddLoading}
                >
                  Hủy
                </Button>
                <Button
                  key="ok"
                  type="primary"
                  onClick={handleAddContact}
                  className="!px-3 !py-1 !h-auto !min-w-[80px] !bg-blue-500 !border-blue-500 !text-white hover:!bg-blue-600 hover:!border-blue-600"
                  htmlType="submit"
                  loading={isAddLoading}
                  disabled={isAddLoading}
                >
                  Thêm mới
                </Button>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              className="!mt-2 !p-3 !rounded-lg !bg-white !text-black"
              onFinish={handleAddContact}
            >
              <div className="!flex !flex-row !items-center !justify-between !w-full !mb-3">
                <div className="!w-1/3">
                  <Form.Item
                    name="avatar"
                    className="!mb-0 !flex !flex-col !items-center"
                  >
                    <Upload
                      name="avatar"
                      listType="picture-circle"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      onChange={handleImageChange}
                      customRequest={({ onSuccess }) =>
                        setTimeout(() => onSuccess("ok"), 0)
                      }
                      className="!flex !justify-center"
                    >
                      {imageUrl ? (
                        <Avatar src={imageUrl} size={70} />
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                    <div className="!mt-1 !text-center !w-full !text-black !text-xs">
                      {imageUrl ? (
                        <Tag color="success">Uploaded</Tag>
                      ) : (
                        <span className="!text-xs">JPG/PNG (2MB)</span>
                      )}
                    </div>
                  </Form.Item>
                </div>
                <div className="!w-2/3">
                  <Form.Item
                    name="name"
                    label={<span className="!text-black">Name</span>}
                    rules={[{ required: true, message: "Required" }]}
                    className="!mb-2"
                    validateTrigger={["onChange", "onBlur"]}
                  >
                    <Input
                      placeholder="Enter contact name"
                      className="!bg-white !text-black !border-gray-300 !rounded"
                    />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label={<span className="!text-black">Email</span>}
                    rules={[
                      { required: true, message: "Required" },
                      { type: "email", message: "Invalid email" },
                    ]}
                    className="!mb-2"
                    validateTrigger={["onChange", "onBlur"]}
                  >
                    <Input
                      placeholder="Enter email address"
                      className="!bg-white !text-black !border-gray-300 !rounded"
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="!flex !flex-row !gap-3">
                <Form.Item
                  name="company"
                  label={<span className="!text-black">Company</span>}
                  rules={[{ required: true, message: "Required" }]}
                  className="!mb-2 !w-1/2"
                  validateTrigger={["onChange", "onBlur"]}
                >
                  <Input
                    placeholder="Enter company name"
                    className="!bg-white !text-black !border-gray-300 !rounded"
                  />
                </Form.Item>
                <Form.Item
                  name="title"
                  label={<span className="!text-black">Title</span>}
                  rules={[{ required: true, message: "Required" }]}
                  className="!mb-2 !w-1/2"
                  validateTrigger={["onChange", "onBlur"]}
                >
                  <Input
                    placeholder="Enter job title"
                    className="!bg-white !text-black !border-gray-300 !rounded"
                  />
                </Form.Item>
              </div>
              <Form.Item
                name="status"
                label={<span className="!text-black">Status</span>}
                rules={[{ required: true, message: "Required" }]}
                className="!mb-1"
                initialValue="Active"
                validateTrigger={["onChange", "onBlur"]}
              >
                <Select
                  placeholder="Select contact status"
                  options={statusOptions}
                  className="!bg-white !text-black !border-gray-300 !rounded"
                />
              </Form.Item>
              <div className="!hidden">
                <Button htmlType="submit" id="submit-form">
                  Submit
                </Button>
              </div>
            </Form>
          </Modal>

          <Drawer
            title={
              <div
                className={`!flex !justify-between !items-center !w-full ${
                  darkMode
                    ? "!bg-[#1f1f1f] !text-white !border-b !border-gray-700"
                    : "!bg-white !text-black !border-b !border-gray-200"
                }`}
              >
                <span className="!text-lg !font-medium">Contact Details</span>
                {!isEditing && (
                  <Button
                    type="primary"
                    onClick={handleEdit}
                    className={`${
                      darkMode ? "!bg-blue-600 !border-blue-700" : ""
                    }`}
                  >
                    Edit
                  </Button>
                )}
              </div>
            }
            placement="right"
            onClose={closeDrawer}
            open={isDrawerVisible}
            width={400}
            className={darkMode ? "dark-drawer" : ""}
            footer={
              isEditing && (
                <div
                  className={`!flex !justify-end !mt-4 !pt-3 !border-t ${
                    darkMode
                      ? "!bg-[#1f1f1f] !text-white !border-gray-700"
                      : "!bg-white !text-black !border-gray-200"
                  }`}
                >
                  <Button
                    onClick={handleCancelEdit}
                    className={`!mr-3 ${
                      darkMode
                        ? "!bg-gray-800 !text-white !border-gray-700 hover:!bg-gray-700"
                        : ""
                    }`}
                    disabled={isUpdateLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleUpdateContact}
                    className={
                      darkMode
                        ? "!bg-blue-600 !border-blue-700 hover:!bg-blue-500"
                        : ""
                    }
                    loading={isUpdateLoading}
                    disabled={isUpdateLoading}
                  >
                    Save
                  </Button>
                </div>
              )
            }
          >
            {selectedContact && (
              <div
                className={`!p-4 !rounded-lg ${
                  darkMode
                    ? "!text-white !bg-[#1f1f1f]"
                    : "!text-black !bg-white"
                }`}
              >
                {!isEditing ? (
                  <div className="!space-y-4">
                    <div className="!flex !justify-center !mb-6">
                      <Avatar src={selectedContact.avatar} size={100} />
                    </div>
                    <p
                      className={`!py-2 !border-b ${
                        darkMode
                          ? "!text-white !border-gray-700"
                          : "!text-black !border-gray-200"
                      }`}
                    >
                      <strong>Name:</strong> {selectedContact.name}
                    </p>
                    <p
                      className={`!py-2 !border-b ${
                        darkMode
                          ? "!text-white !border-gray-700"
                          : "!text-black !border-gray-200"
                      }`}
                    >
                      <strong>Email:</strong> {selectedContact.email}
                    </p>
                    <p
                      className={`!py-2 !border-b ${
                        darkMode
                          ? "!text-white !border-gray-700"
                          : "!text-black !border-gray-200"
                      }`}
                    >
                      <strong>Company:</strong> {selectedContact.company}
                    </p>
                    <p
                      className={`!py-2 !border-b ${
                        darkMode
                          ? "!text-white !border-gray-700"
                          : "!text-black !border-gray-200"
                      }`}
                    >
                      <strong>Title:</strong> {selectedContact.title}
                    </p>
                    <p
                      className={`!py-2 !border-b ${
                        darkMode
                          ? "!text-white !border-gray-700"
                          : "!text-black !border-gray-200"
                      }`}
                    >
                      <strong>Status:</strong>{" "}
                      <Tag color={getStatusColor(selectedContact.status)}>
                        {selectedContact.status}
                      </Tag>
                    </p>
                    {selectedContact.fileName && (
                      <p
                        className={`!py-2 !border-b ${
                          darkMode
                            ? "!text-white !border-gray-700"
                            : "!text-black !border-gray-200"
                        }`}
                      >
                        <strong>Image:</strong> {selectedContact.fileName}
                      </p>
                    )}
                  </div>
                ) : (
                  <Form
                    form={editForm}
                    layout="vertical"
                    className={`!rounded-lg ${
                      darkMode
                        ? "!bg-[#1f1f1f] !text-white"
                        : "!bg-white !text-black"
                    }`}
                  >
                    <div
                      className={`!flex !justify-center !mb-6 ${
                        darkMode ? "!bg-[#1f1f1f]" : "!bg-white"
                      }`}
                    >
                      {isEditing ? (
                        <Form.Item
                          name="avatar"
                          className="!mb-0 !flex !flex-col !items-center"
                        >
                          <Upload
                            name="avatar"
                            listType="picture-circle"
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={handleEditImageChange}
                            customRequest={({ onSuccess }) =>
                              setTimeout(() => onSuccess("ok"), 0)
                            }
                            className="!flex !justify-center"
                          >
                            {editImageUrl ? (
                              <Avatar
                                src={editImageUrl}
                                size={100}
                                className={
                                  darkMode
                                    ? "!border-2 !border-solid !border-white"
                                    : ""
                                }
                              />
                            ) : (
                              <Avatar
                                src={selectedContact.avatar}
                                size={100}
                                className={
                                  darkMode
                                    ? "!border-2 !border-solid !border-white"
                                    : ""
                                }
                              />
                            )}
                          </Upload>
                          <div className="!mt-1 !text-center !w-full !text-xs">
                            {editImageUrl ? (
                              <Tag
                                color="success"
                                className={darkMode ? "!mt-2" : ""}
                              >
                                Ảnh mới đã tải lên
                              </Tag>
                            ) : (
                              <span
                                className={`!text-xs ${
                                  darkMode ? "!text-gray-300" : "!text-gray-500"
                                } !mt-2`}
                              >
                                Nhấn để thay đổi ảnh
                              </span>
                            )}
                          </div>
                        </Form.Item>
                      ) : (
                        <Avatar
                          src={selectedContact.avatar}
                          size={100}
                          className={
                            darkMode
                              ? "!border-2 !border-solid !border-white"
                              : ""
                          }
                        />
                      )}
                    </div>
                    <Form.Item
                      name="name"
                      label={
                        <span
                          className={darkMode ? "!text-white" : "!text-black"}
                        >
                          Name
                        </span>
                      }
                      rules={[{ required: true }]}
                      className={darkMode ? "!bg-[#1f1f1f]" : "!bg-white"}
                    >
                      <Input
                        placeholder="Enter contact name"
                        className={`${
                          darkMode
                            ? "!bg-[#2f2f2f] !text-white !border-gray-700"
                            : "!bg-white !text-black !border-gray-300"
                        } !rounded`}
                      />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label={
                        <span
                          className={darkMode ? "!text-white" : "!text-black"}
                        >
                          Email
                        </span>
                      }
                      rules={[{ required: true }, { type: "email" }]}
                      className={darkMode ? "!bg-[#1f1f1f]" : "!bg-white"}
                    >
                      <Input
                        placeholder="Enter email address"
                        className={`${
                          darkMode
                            ? "!bg-[#2f2f2f] !text-white !border-gray-700"
                            : "!bg-white !text-black !border-gray-300"
                        } !rounded`}
                      />
                    </Form.Item>
                    <Form.Item
                      name="company"
                      label={
                        <span
                          className={darkMode ? "!text-white" : "!text-black"}
                        >
                          Company
                        </span>
                      }
                      rules={[{ required: true }]}
                      className={darkMode ? "!bg-[#1f1f1f]" : "!bg-white"}
                    >
                      <Input
                        placeholder="Enter company name"
                        className={`${
                          darkMode
                            ? "!bg-[#2f2f2f] !text-white !border-gray-700"
                            : "!bg-white !text-black !border-gray-300"
                        } !rounded`}
                      />
                    </Form.Item>
                    <Form.Item
                      name="title"
                      label={
                        <span
                          className={darkMode ? "!text-white" : "!text-black"}
                        >
                          Title
                        </span>
                      }
                      rules={[{ required: true }]}
                      className={darkMode ? "!bg-[#1f1f1f]" : "!bg-white"}
                    >
                      <Input
                        placeholder="Enter job title"
                        className={`${
                          darkMode
                            ? "!bg-[#2f2f2f] !text-white !border-gray-700"
                            : "!bg-white !text-black !border-gray-300"
                        } !rounded`}
                      />
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      label={
                        <span
                          className={darkMode ? "!text-white" : "!text-black"}
                        >
                          Phone
                        </span>
                      }
                      className={darkMode ? "!bg-[#1f1f1f]" : "!bg-white"}
                    >
                      <Input
                        placeholder="Enter phone number"
                        className={`${
                          darkMode
                            ? "!bg-[#2f2f2f] !text-white !border-gray-700"
                            : "!bg-white !text-black !border-gray-300"
                        } !rounded`}
                      />
                    </Form.Item>
                    <Form.Item
                      name="timezone"
                      label={
                        <span
                          className={darkMode ? "!text-white" : "!text-black"}
                        >
                          Timezone/UTC
                        </span>
                      }
                      className={darkMode ? "!bg-[#1f1f1f]" : "!bg-white"}
                    >
                      <Input
                        placeholder="Enter timezone"
                        className={`${
                          darkMode
                            ? "!bg-[#2f2f2f] !text-white !border-gray-700"
                            : "!bg-white !text-black !border-gray-300"
                        } !rounded`}
                      />
                    </Form.Item>
                    <Form.Item
                      name="status"
                      label={
                        <span
                          className={darkMode ? "!text-white" : "!text-black"}
                        >
                          Status
                        </span>
                      }
                      rules={[{ required: true }]}
                      className={darkMode ? "!bg-[#1f1f1f]" : "!bg-white"}
                    >
                      <Select
                        placeholder="Select contact status"
                        options={statusOptions}
                        className={`${
                          darkMode
                            ? "!bg-[#2f2f2f] !text-white !border-gray-700"
                            : "!bg-white !text-black !border-gray-300"
                        } !rounded`}
                        popupClassName={darkMode ? "dark-select-dropdown" : ""}
                      />
                    </Form.Item>
                  </Form>
                )}
              </div>
            )}
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Contacts;
