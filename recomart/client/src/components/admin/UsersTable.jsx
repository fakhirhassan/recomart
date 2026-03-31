import React from 'react';

const roleBadgeColors = {
  admin: 'bg-red-100 text-red-800',
  seller: 'bg-blue-100 text-blue-800',
  user: 'bg-gray-100 text-gray-800',
};

const UsersTable = ({ users, onToggleStatus }) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const userId = user._id || user.id;
            const role = user.role || 'user';
            const isActive = user.isActive !== false;
            const joinedDate = user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : '-';

            return (
              <tr key={userId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">{user.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      roleBadgeColors[role] || roleBadgeColors.user
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-600">{joinedDate}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(userId)}
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
