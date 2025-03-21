import React from "react";
import { Avatar, Button, Card, Popconfirm, Tag } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { getStatusColor } from "../../utils/contactUtils";

const ContactCard = ({ contact, onView, onDelete, darkMode = false }) => {
  const extractDomainFromCompany = (company) => {
    if (!company) return "";
    return company.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
  };

  return (
    <Card
      hoverable
      className={`!overflow-hidden !shadow-sm !rounded-lg !bg-white ${
        darkMode ? "dark-card" : ""
      }`}
      bodyStyle={{ padding: "20px" }}
    >
      <div className="!flex !items-start">
        <Avatar src={contact.avatar} size={60} className="!mr-4" />

        <div className="!flex-1 !min-w-0">
          <div className="!flex !justify-between !items-start">
            <div className="!pr-2 !overflow-hidden">
              <div className="!text-base !font-semibold !mb-1 !truncate !text-black">
                {contact.name}
              </div>

              <div className="!text-gray-800 !text-sm !mb-2 !truncate">
                {contact.email}
              </div>
            </div>

            <Tag color={getStatusColor(contact.status)}>{contact.status}</Tag>
          </div>

          <div className="!text-sm !text-gray-900 !font-medium !mt-1 !truncate">
            {contact.title}
          </div>

          <div className="!text-xs !text-gray-800 !mt-1 !mb-3 !truncate">
            <span className="!inline-flex !items-center">
              <Avatar
                size={16}
                src={`https://logo.clearbit.com/${extractDomainFromCompany(
                  contact.company
                )}.com`}
                className="!mr-1"
              />
              {contact.company}
            </span>
          </div>

          <div className="!flex !justify-end !space-x-3 !mt-3 !pt-2 !border-t">
            <Button
              icon={<EyeOutlined className="!text-white" />}
              onClick={() => onView(contact)}
              className="!bg-blue-500 !border-blue-500 !text-white hover:!bg-blue-600 hover:!border-blue-600 !flex !items-center !justify-center !h-8 !w-8 !rounded !p-0"
            />

            <Popconfirm
              title={
                <div>
                  <span className="!flex !items-center !text-black">
                    <span className="!text-yellow-500 !mr-2">⚠️</span>
                    Delete the contact
                  </span>
                </div>
              }
              description={
                <span className="!text-black">
                  Are you sure to delete this contact?{" "}
                </span>
              }
              onConfirm={() => onDelete(contact.id)}
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
  );
};

export default ContactCard;
