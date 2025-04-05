const Room = require("../models/Room");

exports.joinRoom = async (req, res) => {
  const { roomId, roomPassword } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!room || room.roomPassword !== roomPassword)
      return res.status(400).json({ error: "Invalid room credentials" });

    res.json({ message: "Joined room successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
