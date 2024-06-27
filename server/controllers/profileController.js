const Users = require('../models/users.js');

exports.getMe = async (req, res) => {
    const { _id } = req.user; // Ambil ID pengguna dari req.user
  
    try {
      // Temukan pengguna berdasarkan ID
      const user = await Users.findById(_id).select('-password'); // Jangan sertakan password
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          error: 404,
        });
      }
  
      res.status(200).json({
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  exports.updateProfile = async (req, res) => {
    const { _id } = req.user; // Ambil ID pengguna dari req.user
    const { fullName, nickname, email, phoneNumber } = req.body;
  
    try {
      // Temukan pengguna berdasarkan ID dan perbarui informasi profil
      const updatedUser = await Users.findByIdAndUpdate(
        _id,
        {
          fullName,
          nickname,
          email,
          phoneNumber
        },
        { new: true, runValidators: true } // Kembalikan dokumen yang diperbarui dan jalankan validasi
      ).select('-password'); // Jangan sertakan password
  
      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found",
          error: 404,
        });
      }
  
      res.status(200).json({
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };