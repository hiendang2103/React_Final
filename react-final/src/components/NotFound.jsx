import React from "react";
import { Result } from "antd";

const NotFound = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <Result
          status="404"
          title={<span className="text-4xl font-bold text-blue-600">404</span>}
          subTitle={
            <div className="mt-3 mb-6 text-gray-600">
              <p className="text-lg">Trang không tìm thấy</p>
              <p className="text-sm mt-2">
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di
                chuyển.
              </p>
            </div>
          }
        />
        <div className="flex justify-center mt-6">
          <div className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm">
            Error Code: 404 Page Not Found
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
