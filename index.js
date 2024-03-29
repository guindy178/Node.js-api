const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const io = new Server({
  transports: ['polling', 'websocket'],
  cors: { origin: "*" },
  path: "/socket"
});
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//จ่ายเงิน omise
require('dotenv').config();
const omise = require('omise')({
  'publicKey': process.env.OMISE_PUBLIC_KEY,
  'secretKey': process.env.OMISE_SECRET_KEY,
});

app.post('/checkout-credit-card', async (req, res) => {
 
  try {
    const card1 = req.body.token;
    const price = req.body.price;
    console.log(card1, price)
    const customer = await omise.customers.create({
      'email': 'john.doe@example.com',
      'description': 'John Doe (id: 30)',
      'card': card1
    });

    const charge = await omise.charges.create({
      'amount': price,
      'currency': 'thb',
      'customer': customer.id,
    });

    console.log('Charge -->', charge);

    if (charge.status === 'successful') {
      res.status(200).json({ message: 'คุณทำรายการสำเร็จ', charge });
    } else {
      res.status(200).json({ message: 'คุณทำรายการไม่สำเร็จ', charge });
    }
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการชำระเงิน', error });
  }
});
//




const customerRoutes = require('./src/routes/customer');
app.use('/customer', customerRoutes);

const doctorRoutes = require('./src/routes/doctor');
app.use('/doctor', doctorRoutes);

const employeeRoutes = require('./src/routes/employee');
app.use('/employee', employeeRoutes);



const users = {};
const userItems = () => Object.values(users);

io.on('connection', socket => {
  socket.on('join room', user => {
    users[socket.id] = Object.assign(user, { socketId: socket.id });
    io.emit('join room', userItems());
    console.log(socket.id, 'Join Room');
  });

  socket.on('chat', (toSocketId, messageData) => {
    socket.to(toSocketId).emit('chat', messageData);
    console.log(socket.id, 'Chat to', toSocketId);
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      delete users[socket.id];
      io.emit('join room', userItems());
      console.log(socket.id, 'Disconnected');
    }
  });
});


app.get("/api/getMasseage", (req, res) => {
  const { customerID, doctorsID } = req.query;
  const sql = `SELECT * FROM chat WHERE customerID = ? AND doctorsID = ?`;
  dbCom.query(sql, [customerID, doctorsID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
      return res.status(500).json({ status: false, message: "Failed to retrieve data" });
    }
    return res.status(200).json({ status: true, message: "Data retrieved successfully", data: result });
  });
});

app.post("/api/sendMasseage", async (req, res) => {
  try {
    const { customerID, doctorsID, sender, message, timeSend } = req.body;
    const sql = `INSERT INTO chat (customerID , doctorsID, sender, message, timeSend) VALUES (?, ?, ?, ?, ?);`
    const pam = [customerID, doctorsID, sender, message, new Date(timeSend)];
    await new Promise((resolve, reject) => {
      dbCom.query(sql, pam, (err, results, fields) => {
        if (err) return reject(err);
        resolve({ results, fields });
      });
    });
    res.send({ message: 'Successfully' });
  }
  catch (ex) { res.status(500).send({ message: ex.message }); }
});





const dbCom = require('./src/shared/db.util.js'); // นำเข้า dbCom จากไฟล์ db.js
dbCom.connect((err) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err);
      return;
    }
  
    console.log('เชื่อมต่อฐานข้อมูล MySQL เรียบร้อยแล้ว');
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
io.listen(3001, () => {
  console.log("IO running")
})