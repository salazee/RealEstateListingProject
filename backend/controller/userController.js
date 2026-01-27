const User = require('../model/auth');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ message: "Users fetched", users });
  } catch (err) {
    console.error("Error getting users:", error)
    res.status(500).json({ message: err.message });
  }
};


const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['buyer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const updated = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, select: '-password' }
  );

  if (!updated) return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'Role updated', user: updated });
};



// Delete a user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted", deleted });
  } catch (err) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, deleteUser, updateUser };
