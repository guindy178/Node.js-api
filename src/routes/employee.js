const express = require('express');
const router = express.Router();
const multer = require('multer');
const dbCom = require('../shared/db.util.js'); // แก้ไขเส้นทางที่ใช้ในการอ้างอิงไฟล์
const storage = multer.diskStorage({


  destination: function (req, file, cb) {
    cb(null, 'D:/frontend-backend/api-book/image');
  },
  filename: function (req, file, cb) {
    const imagename = Date.now() + '-' + file.originalname;
    req.imagename = imagename; // เก็บชื่อไฟล์ในตัวแปร req.imagename
    cb(null, imagename);
  }
});
const upload = multer({ storage: storage });


const path = require('path');
// ... โค้ดอื่น ๆ ...
router.get('/api/image1/:imageFile', (req, res) => {
  const imageFile = req.params.imageFile;
    
  const imagePath = path.join(__dirname, '../../image', imageFile);

  res.sendFile(imagePath);

});



router.post("/api/add/Product", upload.single('imagefile'), (req, res) => {
  const {
    productName,
    productDetail,
    price,
    quantity,
    Produced_at,
    Notification_number,
    component,
    use,
    typeID,
  } = req.body;

  // 2. อ่านข้อมูลของไฟล์รูปภาพและแปลงเป็น buffer
  const imagename = req.imagename; // ข้อมูลรูปภาพเป็น buffer

  console.log(
    productName, productDetail, price, quantity, Produced_at, Notification_number, component, use, typeID
  );
  console.log('รูปภาพ:', imagename);

  if (!productName || !productDetail || !price || !quantity  || !typeID) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 3. เพิ่มข้อมูลรูปภาพและข้อมูลสินค้าลงในฐานข้อมูล MySQL
  const sql =
  'INSERT INTO product(productName, productDetail, price, quantity, imagefile, Produced_at, Notification_number, component, uses, typeID)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [
    productName, productDetail, price, quantity, imagename, Produced_at, Notification_number, component, use, typeID,
  ];

  dbCom.query(sql, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', err);
      return res.status(500).json({ status: false, message: "Failed to add product data" });
    }
    return res.status(200).json({ status: true, message: "Product data added successfully" });
  });
});


router.post('/api/upload/:productID', upload.single('imageFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('ไม่พบไฟล์รูปภาพ');
  }

  const imagename = req.imagename; // ใช้ชื่อไฟล์ที่เก็บใน req.imagename
  const productID = req.params.productID;
  
  const sql = 'UPDATE product SET imagefile = ? WHERE productID = ?';
  dbCom.query(sql, [imagename, productID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล: ' + err.stack);
      return res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล');
    }
    console.log(imagename)
    console.log('ชื่อไฟล์รูปภาพถูกเพิ่มในฐานข้อมูล');
    res.status(200).send('อัปโหลดรูปภาพเรียบร้อยแล้ว');
  });
});

router.put('/api/editProduct/:productID', (req, res) => {
  const {
    productName,
    productDetail,
    price,
    quantity,
    Produced_at,
    Notification_number,
    component,
    uses,
  } = req.body;

  const productID = req.params.productID;

  try {
    dbCom.query(
      'UPDATE product SET productName = ?, productDetail = ? ,price = ?, quantity = ?, Produced_at = ?, Notification_number = ?, component = ?, uses = ?' +
     
      'WHERE productID = ?',
      [productName, productDetail, price, quantity, Produced_at, Notification_number, component, uses, productID],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ message: "Failed to update user" });
        }
        return res.status(200).json({ message: "User successfully updated" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});




router.get('/api/product/:productId', (req, res) => {
  try {
    const productId = req.params.productId;
    dbCom.query('SELECT * FROM product WHERE productID= ?', [productId], (err, result, fields) => {
      if (err) {
        return res.status(500).json({ status: false, message: "Failed to retrieve district data" });
      }
      return res.status(200).json({ status: true, message: 'ดึงข้อมูลเขตสำเร็จ', data: result[0] });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


router.get('/api/producttype', (req, res) => {
  try {
    dbCom.query(`SELECT * FROM producttype WHERE refID IS NULL;`, (err, result, fields) => {
      
      if (err) {
        return res.status(500).json({ status: false, message: "Failed to retrieve user data" });
      }
      return res.status(200).json({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: result });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.get('/api/category/product/:typeID', (req, res) => {
  try {
    const typeID = req.params.typeID;
    dbCom.query('SELECT * FROM `producttype` WHERE refID = ?;', [typeID], (err, result, fields) => {
      if (err) {
        return res.status(500).json({ status: false, message: "Failed to retrieve district data" });
      }
      return res.status(200).json({ status: true, message: 'ดึงข้อมูลเขตสำเร็จ', data: result });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});
router.put('/api/status/:id', (req, res) => {
  const status = req.body.status;
  const doctorsID = req.params.id;

  if (![0, 1].includes(status)) {
    return res.status(400).json({ message: 'Invalid isActive value' });
  }
  // ทำการอัปเดตค่า isActive ในฐานข้อมูลของผู้ใช้งานที่ต้องการ
  dbCom.query(
    'UPDATE doctors SET status = ? WHERE doctorsID  = ?',
    [status, doctorsID],
    (err, result, fields) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update isActive status' });
      }
      return res.status(200).json({ message: 'status updated successfully' });
    }
  );
});

router.delete('/api/delete/:id', (req, res) => { 
  const customerID = req.params.id;

  dbCom.query('DELETE FROM customer WHERE customerID = ?', 
  [customerID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการลบผู้ใช้งาน:', err);
      res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
      return;
    }

    res.json({ status: true, message: 'ลบผู้ใช้งานสำเร็จ' });
  });
});

router.delete('/api/delete/doctor/:id', (req, res) => { 
  const doctorsID = req.params.id;

  dbCom.query('DELETE FROM doctors WHERE doctorsID = ?', 
  [doctorsID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการลบผู้ใช้งาน:', err);
      res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
      return;
    }

    res.json({ status: true, message: 'ลบผู้ใช้งานสำเร็จ' });
  });
});

router.put('/api/active/doctor/:id', (req, res) => {
  const isActive = req.body.isActive;
  const doctorsID  = req.params.id;

  if (![0, 1].includes(isActive)) {
    return res.status(400).json({ message: 'Invalid isActive value' });
  }
  // ทำการอัปเดตค่า isActive ในฐานข้อมูลของผู้ใช้งานที่ต้องการ
  dbCom.query(
    'UPDATE doctors SET isActive = ? WHERE doctorsID   = ?',
    [isActive, doctorsID ],
    (err, result, fields) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update isActive status' });
      }
      return res.status(200).json({ message: 'isActive status updated successfully' });
    }
  );
});

router.put('/api/active/:id', (req, res) => {
  const isActive = req.body.isActive;
  const customerID = req.params.id;

  if (![0, 1].includes(isActive)) {
    return res.status(400).json({ message: 'Invalid isActive value' });
  }
  // ทำการอัปเดตค่า isActive ในฐานข้อมูลของผู้ใช้งานที่ต้องการ
  dbCom.query(
    'UPDATE customer SET isActive = ? WHERE customerID  = ?',
    [isActive, customerID],
    (err, result, fields) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update isActive status' });
      }
      return res.status(200).json({ message: 'isActive status updated successfully' });
    }
  );
});

router.get('/api/doctors/petition', (req, res) => {
  try {
    dbCom.query(`SELECT * FROM doctors WHERE status = 1 ;`, (err, result, fields) => {
      
      if (err) {
        return res.status(500).json({ status: false, message: "Failed to retrieve user data" });
      }
      return res.status(200).json({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: result });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


  router.get('/api/customer', (req, res) => {
    try {
      dbCom.query(`SELECT * FROM customer ;`, (err, result, fields) => {
        
        if (err) {
          return res.status(500).json({ status: false, message: "Failed to retrieve user data" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: result });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ status: false, message: "Internal server error" });
    }
  });

router.get('/api/doctors', (req, res) => {
  try {
    dbCom.query(`SELECT * FROM doctors WHERE status = 0 ;`, (err, result, fields) => {
      
      if (err) {
        return res.status(500).json({ status: false, message: "Failed to retrieve user data" });
      }
      return res.status(200).json({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: result });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});
  router.get('/api/customer', (req, res) => {
    try {
      dbCom.query(`SELECT * FROM customer ;`, (err, result, fields) => {
        
        if (err) {
          return res.status(500).json({ status: false, message: "Failed to retrieve user data" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: result });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ status: false, message: "Internal server error" });
    }
  });

  router.post("/api/loginSuperadmin", async (req, res) => {
    const userName = req.body.username;
    const password = req.body.password;
    try {
      console.log(userName, password)
      if (!userName || !password) {
        return res.status(400).json({ message: "Missing required fields" });
       
      }
  
      dbCom.query(
      
        'SELECT * FROM `employees` WHERE userName = ? AND password = ? AND isActive = 1',
        [userName, password],
        (err, result, fields) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
          }
          if (result.length > 0) {
            const user = result[0]; // ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบสำเร็จ
            console.log(user.firstName); // ตรวจสอบค่า firstName ของผู้ใช้งาน
            return res.json({ status: true, message: 'ล็อคอินสำเร็จ', data: user });
          } else {
            // Login ไม่สำเร็จ
             // ตรวจสอบค่า firstName ของผู้ใช้งาน
            return res.json({ status: false, message: 'ล็อคอินไม่สำเร็จ' });
          }
  
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });

  router.post("/api/login", async (req, res) => {
    const userName = req.body.username;
    const password = req.body.password;
    try {
      console.log(userName, password)
      if (!userName || !password) {
        return res.status(400).json({ message: "Missing required fields" });
       
      }
  
      dbCom.query(
      
        'SELECT * FROM `employees` WHERE userName = ? AND password = ? AND isActive = 1',
        [userName, password],
        (err, result, fields) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
          }
          if (result.length > 0) {
            const user = result[0]; // ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบสำเร็จ
            console.log(user.firstName); // ตรวจสอบค่า firstName ของผู้ใช้งาน
            return res.json({ status: true, message: 'ล็อคอินสำเร็จ', data: user });
          } else {
            // Login ไม่สำเร็จ
             // ตรวจสอบค่า firstName ของผู้ใช้งาน
            return res.json({ status: false, message: 'ล็อคอินไม่สำเร็จ' });
          }
  
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });
  
module.exports = router;

