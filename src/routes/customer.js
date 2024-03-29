const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
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

router.get('/api/doctors', async (req, res) => {
  try {
    dbCom.query(`SELECT
  doctors.doctorsID,
  doctors.firstName,
  doctors.lastName,
  doctors.email,
  doctors.imageFile,
  doctors.birthdays,
  doctors.signup_date,
  doctors.work_history,
  doctors.symptoms_consult,
  doctors.price,
  doctors.mobilePhone,
  GROUP_CONCAT(DISTINCT language.language) AS language,
  GROUP_CONCAT(DISTINCT university.university) AS university,
  GROUP_CONCAT(DISTINCT educational_qualification.level) AS level,
  GROUP_CONCAT(DISTINCT expertise.expertiseName) AS expertiseNames,
  GROUP_CONCAT(DISTINCT department.departmentName) AS departmentNames
FROM
  doctors
LEFT JOIN doctors_language ON doctors.doctorsID = doctors_language.doctorsID
LEFT JOIN language ON doctors_language.languageID = language.languageID
LEFT JOIN doctors_university_qulalification ON doctors.doctorsID = doctors_university_qulalification.doctorsID
LEFT JOIN university ON doctors_university_qulalification.universityID = university.universityID
LEFT JOIN educational_qualification ON doctors_university_qulalification.qulalificationID = educational_qualification.qulalificationID
LEFT JOIN doctors_expertise ON doctors.doctorsID = doctors_expertise.doctorsID
LEFT JOIN expertise ON doctors_expertise.expertiseID = expertise.expertiseID
LEFT JOIN department ON expertise.departmentID = department.departmentID
WHERE
  doctors.imageFile IS NOT NULL AND doctors.imageFile <> '' -- เงื่อนไขให้ไม่แสดงเมื่อ imageFile เป็น null หรือว่าง
  AND language.language IS NOT NULL AND language.language <> '' -- เงื่อนไขให้ไม่แสดงเมื่อ Language เป็น null หรือว่าง
  AND university.university IS NOT NULL AND university.university <> '' -- เงื่อนไขให้ไม่แสดงเมื่อ university เป็น null หรือว่าง
  AND educational_qualification.level IS NOT NULL AND educational_qualification.level <> '' -- เงื่อนไขให้ไม่แสดงเมื่อ level เป็น null หรือว่าง
  AND expertise.expertiseName IS NOT NULL AND expertise.expertiseName <> '' -- เงื่อนไขให้ไม่แสดงเมื่อ expertiseNames เป็น null หรือว่าง
GROUP BY
  doctors.doctorsID,
  doctors.firstName,
  doctors.lastName,
  doctors.gender,
  doctors.email,
  doctors.userName,
  doctors.password,
  doctors.imageFile,
  doctors.birthdays,
  doctors.signup_date,
  doctors.work_history,
  doctors.symptoms_consult,
  doctors.price,
  doctors.isActive
LIMIT 2;`, (err, result, fields) => {
      
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

router.post("/api/add/order", (req, res) => {
  const { customerID, orderDate, shipDate, receiveDate, status, productID, quantity, unit_price } = req.body;
  console.log(customerID , productID)
  const checkOrderSQL = `SELECT orderID FROM \`order\` WHERE customerID = ? AND status = '0'`;

  const values = [customerID];

  dbCom.query(checkOrderSQL, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบออเดอร์:', err);
      return res.status(500).json({ status: false, message: "Failed to check order data" });
    }

    if (result.length > 0) {
      // ถ้ามีออเดอร์ที่รออยู่สำหรับลูกค้านี้
      const orderID = result[0].orderID;

      // ตรวจสอบว่าสินค้าที่พยายามเพิ่มอยู่ในออเดอร์เดิมหรือไม่
      const checkProductInOrderSQL = `SELECT quantity FROM OrderDetail WHERE orderID = ? AND productID = ?`;
      const checkProductInOrderValues = [orderID, productID];

      dbCom.query(checkProductInOrderSQL, checkProductInOrderValues, (err, result) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการตรวจสอบสินค้าในออเดอร์:', err);
          return res.status(500).json({ status: false, message: "Failed to check product in order" });
        }

        if (result.length > 0) {
          // ถ้าสินค้าอยู่ในออเดอร์เดิม ให้อัปเดตจำนวนสินค้า
          const existingQuantity = result[0].quantity;

          const updateOrderDetailSQL = `UPDATE OrderDetail SET quantity = ? WHERE orderID = ? AND productID = ?`;
          const updateOrderDetailValues = [existingQuantity + quantity, orderID, productID];

          dbCom.query(updateOrderDetailSQL, updateOrderDetailValues, (err, result) => {
            if (err) {
              console.error('เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้าในออเดอร์:', err);
              return res.status(500).json({ status: false, message: "Failed to update order detail data" });
            }
            return res.status(200).json({ status: true, message: "Order detail data updated successfully" });
          });
        } else {
          // ถ้าสินค้าไม่อยู่ในออเดอร์เดิม ให้เพิ่มสินค้าใหม่
          const insertOrderDetailSQL = `INSERT INTO OrderDetail (orderID, productID, quantity, unit_price)
            VALUES (?, ?, ?, ?)`;
          const orderDetailValues = [orderID, productID, quantity, unit_price];

          dbCom.query(insertOrderDetailSQL, orderDetailValues, (err, result) => {
            if (err) {
              console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลในตาราง OrderDetail:', err);
              return res.status(500).json({ status: false, message: "Failed to add order detail data" });
            }
            return res.status(200).json({ status: true, message: "Order detail data added successfully" });
          });
        }
      });
    } else {
      // ถ้าไม่มีออเดอร์ที่รออยู่สำหรับลูกค้านี้
      const insertOrderSQL = `INSERT INTO \`order\` (customerID, shipDate, receiveDate, status)
        VALUES (?, NULL, NULL, '0')`;

      dbCom.query(insertOrderSQL, values, (err, result) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', err);
          return res.status(500).json({ status: false, message: "Failed to add order data" });
        }

        // เพื่อให้สามารถใช้ LAST_INSERT_ID() ในการเพิ่มข้อมูลในตาราง OrderDetail
        const orderID = result.insertId;

        // เพิ่มข้อมูลในตาราง OrderDetail
        const insertOrderDetailSQL = `INSERT INTO OrderDetail (orderID, productID, quantity, unit_price)
          VALUES (?, ?, ?, ?)`;
        const orderDetailValues = [orderID, productID, quantity, unit_price];

        dbCom.query(insertOrderDetailSQL, orderDetailValues, (err, result) => {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลในตาราง OrderDetail:', err);
            return res.status(500).json({ status: false, message: "Failed to add order detail data" });
          }
          return res.status(200).json({ status: true, message: "Order and order detail data added successfully" });
        });
      });
    }
  });
});

router.get('/api/products', (req, res) => {
  try {
    dbCom.query(
      'SELECT p.productID, p.productName, p.imagefile, SUM(od.quantity) AS totalSales ' +
      'FROM Product p ' +
      'JOIN OrderDetail od ON p.productID = od.productID ' +
      'JOIN `Order` o ON od.orderID = o.orderID ' +
      'GROUP BY p.productID, p.productName ' +
      'ORDER BY totalSales DESC ' +
      'LIMIT 3',
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ status: false, message: "Failed to retrieve product data" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: result });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});



router.get('/api/getcart/:customerID', (req, res) => {
  try {
    const customerID = req.params.customerID;
    dbCom.query(
      'SELECT o.customerID, od.orderID, od.productID, od.quantity, od.unit_price, p.productName, p.imagefile ' +
      'FROM OrderDetail od ' +
      'JOIN Product p ON od.productID = p.productID ' +
      'JOIN `Order` o ON od.orderID = o.orderID ' +
      'WHERE o.customerID = ? AND o.status = 1;',
      [customerID],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลเรียบร้อย', data: result });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.get('/api/cart/:customerID', (req, res) => {
  try {
    const customerID = req.params.customerID;
    dbCom.query(
      'SELECT o.customerID, od.orderID, od.productID, od.quantity, od.unit_price, p.productName, p.imagefile ' +
      'FROM OrderDetail od ' +
      'JOIN Product p ON od.productID = p.productID ' +
      'JOIN `Order` o ON od.orderID = o.orderID ' +
      'WHERE o.customerID = ? AND o.status = 0;',
      [customerID],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลเรียบร้อย', data: result });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


router.get('/api/doctorsById/:doctorsID', (req, res) => {
  try {
    const doctorsID = req.params.doctorsID;
    dbCom.query(
      'SELECT doctors.firstName, doctors.lastName, doctors.imageFile '+
      'FROM `doctors` WHERE doctorsID = ?;',
      [doctorsID],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ status: false, message: "Failed to retrieve address data" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลเขตสำเร็จ', data: result[0] });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.get('/api/message/:customerID', (req, res) => {
  try {
    const customerID = req.params.customerID;
    dbCom.query(
      'SELECT DISTINCT ch.customerID, ch.doctorsID, d.firstName, d.lastName, d.imageFile ' +
      'FROM chat ch ' +
      'INNER JOIN doctors d ON ch.doctorsID = d.doctorsID ' +
      'WHERE ch.customerID = ?; ',
      [customerID],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ status: false, message: "Failed to retrieve address data" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลเขตสำเร็จ', data: result });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


router.get('/api/producttype/:typeID', (req, res) => {
  try {
    const typeID = req.params.typeID;
    dbCom.query(
      'SELECT * FROM producttype WHERE refID = ?',
      [typeID],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ status: false, message: "Failed to retrieve address data" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลเขตสำเร็จ', data: result });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.get('/api/product/type', (req, res) => {
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

router.get('/api/product', (req, res) => {
  try {
    dbCom.query(`SELECT * FROM product JOIN producttype ON product.typeID = producttype.typeID;`, (err, result, fields) => {
      
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

router.delete('/api/delete/address/:customerId', (req, res) => { 
  const customerId = req.params.customerId;
  const addressId = req.body.addressId; 
  console.log(customerId, addressId)
  dbCom.query('DELETE FROM `address` WHERE customerID = ? AND addressID = ?', 
  [customerId, addressId], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการลบผู้ใช้งาน:', err);
      res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
      return;
    }

    res.json({ status: true, message: 'ลบผู้ใช้งานสำเร็จ' });
  });
});

router.get('/api/address/user/:addressId', (req, res) => {
  try {
    const addressId = req.params.addressId;
    dbCom.query(
      'SELECT a.*, s.subdistrictName, d.districtName, p.provinceName ' +
      'FROM address a ' +
      'INNER JOIN Subdistrict s ON a.subdistrictID = s.subdistrictID ' +
      'INNER JOIN District d ON s.districtID = d.districtID ' +
      'INNER JOIN Province p ON d.provinceID = p.provinceID ' +
      'WHERE a.addressID = ? ' + // เพิ่มช่องว่างระหว่างคำสั่ง SQL และ WHERE clause
      'ORDER BY a.defaults DESC;',
      [addressId],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ status: false, message: "Failed to retrieve address data" });
        }
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลเขตสำเร็จ', data: result[0] });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.put("/api/updateappointment", (req, res) => {
  const { idappointment } = req.body;
  console.log(idappointment)
  const sql = 'UPDATE appointment SET status = 1 WHERE appointmentID  = ?';
  const values = [idappointment];

  dbCom.query(sql, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', err);
      return res.status(500).json({ status: false, message: "Failed to update appointment data" });
    }
    return res.status(200).json({ status: true, message: "Appointment data updated successfully" });
  });
});
router.put("/api/update/address/:customerId", (req, res) => {
  const { customerId } = req.params; // รับค่า customerId จากพารามิเตอร์ใน URL
  const { addressID, firstName, address_details, phone_number, subdistrictID, location, defaults } = req.body;
  console.log(customerId, addressID, firstName, address_details, phone_number, subdistrictID,  location)

  if (!customerId || !addressID || !firstName || !address_details || !phone_number || !subdistrictID || !location) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = 'UPDATE address SET firstName = ?, address_details = ?, phone_number = ?, subdistrictID = ?, location = ?, defaults = ? WHERE addressID = ? AND customerID = ?';
  const values = [firstName, address_details, phone_number, subdistrictID, location, defaults, addressID, customerId];

  dbCom.query(sql, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', err);
      return res.status(500).json({ status: false, message: "Failed to update address data" });
    }
    return res.status(200).json({ status: true, message: "Address data updated successfully" });
  });
});





router.put('/api/address/:customerID', (req, res) => {
  const customerId = req.params.customerID;
  const addressId = req.body.addressID; // แก้ไขการเว้นวรรคที่ไม่จำเป็น

  console.log(addressId, customerId)
  if (!customerId || !addressId ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    dbCom.query(
      'UPDATE address ' + // เพิ่มช่องว่างหลังชื่อตาราง
      'SET `defaults` = CASE ' + // เพิ่มช่องว่างหลัง CASE
      'WHEN addressID = ? THEN 1 ' + // เพิ่มช่องว่างหลัง THEN และเพิ่มช่องว่างหลังคำว่า 1
      'ELSE 0 ' + // เพิ่มช่องว่างหลัง ELSE และเพิ่มช่องว่างหลังคำว่า 0
      'END ' + // เพิ่มช่องว่างหลัง END
      'WHERE customerID = ?;',
      [addressId, customerId],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ message: "Failed to update address" });
        }
        return res.status(200).json({ message: "address successfully updated" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});


router.post("/api/add/address", (req, res) => {
  const {  firstName , address_details, phone_number, customerID, subdistrictID, location   } = req.body;

  console.log(firstName, address_details, phone_number, customerID, subdistrictID, location )

  if (!firstName  || !address_details || !phone_number || !customerID || !subdistrictID || !location  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const sql = 'INSERT INTO address (firstName, address_details, phone_number, customerID, subdistrictID, location) VALUES ( ?, ?, ?, ?, ? , ?)';
  const values = [firstName, address_details, phone_number, customerID, subdistrictID, location];

  dbCom.query(sql, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', err);
      return res.status(500).json({ status: false, message: "Failed to add appointment data" });
    }
    return res.status(200).json({ status: true, message: "Address data added successfully" });
  });
});



router.get('/api/address/:customerId', (req, res) => {
  try {
    const customerId = req.params.customerId;
    dbCom.query(
      'SELECT a.*, s.subdistrictName, d.districtName, p.provinceName ' +
      'FROM address a ' +
      'INNER JOIN Subdistrict s ON a.subdistrictID = s.subdistrictID ' +
      'INNER JOIN District d ON s.districtID = d.districtID ' +
      'INNER JOIN Province p ON d.provinceID = p.provinceID ' +
      'WHERE a.customerID = ? ' +
      'ORDER BY a.defaults DESC;',
      [customerId],
      (err, result, fields) => {
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

router.get('/api/province', (req, res) => {
  try {
    dbCom.query(`SELECT * FROM province ;`, (err, result, fields) => {
      
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

router.get('/api/district/:provinceId', (req, res) => {
  try {
    const provinceId = req.params.provinceId;
    dbCom.query('SELECT * FROM district WHERE provinceID = ?;', [provinceId], (err, result, fields) => {
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

router.get('/api/subdistrict/:districtId', (req, res) => {
  try {
    const districtId = req.params.districtId;
    dbCom.query(`SELECT * FROM subdistrict WHERE districtID = ? ;`, [districtId], (err, result, fields) => {
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


router.post('/api/upload/:id', upload.single('imageFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('ไม่พบไฟล์รูปภาพ');
  }

  const imagename = req.imagename; // ใช้ชื่อไฟล์ที่เก็บใน req.imagename
  const userID = req.params.id;
  
  const sql = 'UPDATE customer SET imageFile = ? WHERE customerID = ?';
  dbCom.query(sql, [imagename, userID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล: ' + err.stack);
      return res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล');
    }
    console.log(imagename)
    console.log('ชื่อไฟล์รูปภาพถูกเพิ่มในฐานข้อมูล');
    res.status(200).send('อัปโหลดรูปภาพเรียบร้อยแล้ว');
  });
});
//-----------------------------------------------------------------------------------------------------------//





router.get('/', (req, res) => {
  res.send('Hello from customer.js');
});

router.get('/about', (req, res) => {
  res.send('About Customer');
});
router.post("/api/Change/:id", async (req, res) => {
  
  const userID = req.params.id; 
 
  const password = req.body.password;
  const newPassword = req.body.newPassword; // รหัสผ่านใหม่


  try {
    if (!newPassword || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ตรวจสอบว่า username หรือรหัสผ่านเก่าถูกต้องหรือไม่
    dbCom.query(
      'SELECT COUNT(*) AS count FROM customer WHERE customerID = ? AND password = ?',
      [userID, password],
      (error, results) => {
        if (error) {
          throw error;
        }

        const passwordMatchCount = results[0].count;

        if (passwordMatchCount === 0) {
          return res.status(401).json({ message: "Invalid customerID or old password" });
        }

        // ทำการอัปเดตรหัสผ่านใหม่ในฐานข้อมูล
        dbCom.query(
          'UPDATE customer SET password = ? WHERE customerID = ?',
          [newPassword, userID],
          (error, updateResults) => {
            if (error) {
              throw error;
            }

            return res.status(200).json({ message: "Password updated successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/api/Change/:id", async (req, res) => {

  const userID = req.params.id; 
  const userName = req.body.username;
  const password = req.body.password;



  try {
    if (!userName || !password ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(password);

    // ตรวจสอบว่า username หรือ password ซ้ำกันหรือไม่
    dbCom.query(
      'SELECT COUNT(*) AS count FROM customer WHERE customerID = ? AND password = ?',
      [userID, password],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ message: "Failed to create a new user" });
        }
        if (result[0].count > 0) {
          return res.status(409).json({ message: "Username or password already exists" });
        }
        // ถ้าไม่ซ้ำกันในฐานข้อมูล ก็ทำการ INSERT
        dbCom.query(
          'INSERT INTO customer(userName, password, mobilePhone, gender, firstName, lastName, email, birthday, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [userName, password, mobilePhone, gender, firstName, lastName, email, birthday, isActive],
          (err, result, fields) => {
            if (err) {
              return res.status(500).json({ message: "Failed to create a new user" });
            }
            return res.status(201).json({ message: "New user successfully created" });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post("/api/appointment", (req, res) => {
  const { customerID, doctorsID, history, symptom, consult, payment } = req.body;

  console.log(customerID, doctorsID, history, symptom, consult, payment);

  // if (!customerID || !doctorsID || !history || !symptom || !consult  || !payment) {
  //   return res.status(400).json({ message: "Missing required fields" });
  // }

  const appointmentSQL = 'INSERT INTO appointment (customerID, doctorsID, history, symptom, consult) VALUES (?, ?, ?, ?, ?)';
  const paymentSQL = 'INSERT INTO payment (appointmentID, payment) VALUES (?, ?)';

  const appointmentValues = [customerID, doctorsID, history, symptom, consult];
  const paymentValues = [customerID, payment];

  dbCom.query(appointmentSQL, appointmentValues, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลการนัดหมาย:', err);
      return res.status(500).json({ status: false, message: "Failed to add appointment data" });
    }

    const appointmentID = result.insertId;

    // เพิ่มข้อมูลการชำระเงินโดยใช้ค่า appointmentID ที่ได้จากการสร้างแอปอินท์เมนต์
    dbCom.query(paymentSQL, [appointmentID, payment], (paymentErr, paymentResult) => {
      if (paymentErr) {
        console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลการชำระเงิน:', paymentErr);
        return res.status(500).json({ status: false, message: "Failed to add payment data" });
      }

      return res.status(200).json({
        status: true,
        appointmentID: appointmentID,
        message: "Appointment and Payment data added successfully",
      });
    });
  });
});


router.delete('/api/delete/cartProduct', (req, res) => { 
  const productID = req.body.productID;
  const orderID = req.body.orderID;
  dbCom.query('DELETE FROM orderdetail WHERE productID = ? AND orderID = ?', 
  [orderID,productID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการลบผู้ใช้งาน:', err);
      res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
      return;
    }

    res.json({ status: true, message: 'ลบสินค้าสำเร็จ' });
  });
});

//ตัด  productID quantity

router.post("/api/payments", (req, res) => {
  const payments = req.body; // รับข้อมูลการชำระเงินที่ส่งมาในรูปแบบอาเรย์
  console.log(payments); // แสดงข้อมูลอาเรย์ในทางออกทางคอนโซล

  // วนลูปผ่านแต่ละรายการในอาเรย์ payments
  payments.forEach(payment => {
    const [ProductID, OderID] = payment;
    
    // ทำสิ่งที่คุณต้องการด้วยข้อมูลในแต่ละรายการ payment
    console.log(`ProductID: ${ProductID} OderID: ${OderID}`);
    
    // สามารถทำการบันทึกข้อมูลลงในฐานข้อมูลหรือประมวลผลข้อมูลตามความต้องการของคุณได้ที่นี่
  });

  // ส่งคำตอบกลับให้รู้ว่าข้อมูลได้รับและดำเนินการเรียบร้อย
  
  res.status(200).json({ message: 'ข้อมูลได้รับและดำเนินการเรียบร้อย' });
});



    router.post("/api/quantity", (req, res) => {
      const payments = req.body; // รับข้อมูลการชำระเงินที่ส่งมาในรูปแบบอาเรย์
      console.log(payments); // แสดงข้อมูลอาเรย์ในทางออกทางคอนโซล
      
      // วนลูปผ่านแต่ละรายการในอาเรย์ payments
      dbCom.beginTransaction(function (err) {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการเริ่มทรานแซคชัน:', err);
          return res.status(500).json({ status: false, message: "Failed to start transaction" });
        }

        payments.forEach(payment => {
          const [ProductID, quantity, orderID] = payment;
          
          const updateSql = 'UPDATE product SET quantity = quantity - ? WHERE productID = ?';
          const updateValues = [quantity, ProductID];

          console.log(`ProductID: ${ProductID}, quantity: ${quantity} , OderID: ${orderID}`);

          dbCom.query(updateSql, updateValues, (err, result) => {
            if (err) {
              return dbCom.rollback(function () {
                console.error('เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้า:', err);
                return res.status(500).json({ status: false, message: "Failed to update product quantity" });
              });
            }
          });
        });

          dbCom.commit(function (err) {
            if (err) {
              return dbCom.rollback(function () {
                console.error('เกิดข้อผิดพลาดในการ commit ทรานแซคชัน:', err);
                return res.status(500).json({ status: false, message: "Failed to commit transaction" });
              });
            }

            return res.status(200).json({ status: true, message: "Payment data added and product quantity updated successfully" });
          });
        });
      });

      router.post("/api/payment", (req, res) => {
        const { orderID, payment, customerID} = req.body;
        console.log(orderID, payment, customerID)

        dbCom.beginTransaction(function (err) {
          if (err) {
            console.error('เกิดข้อผิดพลาดในการเริ่มทรานแซคชัน:', err);
            return res.status(500).json({ status: false, message: "Failed to start transaction" });
          }

          const paymentSql = 'INSERT INTO payment (orderID, payment) VALUES (?, ?)';
          const paymentValues = [orderID, payment];

          dbCom.query(paymentSql, paymentValues, (err, result) => {
            if (err) {
              return dbCom.rollback(function () {
                console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลการชำระเงิน:', err);
                return res.status(500).json({ status: false, message: "Failed to add payment data" });
              });
            }

              const updateOrderSql = 'UPDATE `order` SET status = 1 WHERE orderID = ? AND customerID = ?';
              const updateOrderValues = [orderID, customerID];

              dbCom.query(updateOrderSql, updateOrderValues, (err, result) => {
                if (err) {
                  return dbCom.rollback(function () {
                    console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะคำสั่งซื้อ:', err);
                    return res.status(500).json({ status: false, message: "Failed to update order status" });
                  });
                }

                dbCom.commit(function (err) {
                  if (err) {
                    return dbCom.rollback(function () {
                      console.error('เกิดข้อผิดพลาดในการ commit ทรานแซคชัน:', err);
                      return res.status(500).json({ status: false, message: "Failed to commit transaction" });
                    });
                  }

                  return res.status(200).json({ status: true, message: "Payment data added and product quantity updated successfully" });
                });
              });
            });
          });
        });
  


router.put('/api/edit/:id', (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const mobilePhone = req.body.mobilePhone;
  const email = req.body.email;
  const userID = req.params.id;

  console.log(mobilePhone , firstName , lastName ,email)

  try {
   

    dbCom.query(
      'UPDATE customer SET firstName = ?, lastName = ?, mobilePhone = ?, email = ? WHERE customerID = ?',
      [firstName, lastName, mobilePhone, email, userID],
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

router.get('/api/user/:id', (req, res) => {
    const userID = req.params.id; // รับค่า userId จากพารามิเตอร์ URL
    dbCom.query('SELECT * FROM `customer` WHERE customerID = ?', [userID], (err, result, fields) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', data: null });
      } else {
        if (result.length > 0) {
          const userData = result[0];
          res.json({ status: true, message: 'ดึงข้อมูลผู้ใช้สำเร็จ', data: userData });
        } else {
          res.status(404).json({ status: false, message: 'ไม่พบข้อมูลผู้ใช้', data: null });
        }
      }
    });
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
      
        'SELECT * FROM customer WHERE userName = ? AND password = ? AND isActive = 1',
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
            return res.json({ status: false, message: 'ล็อคอินไม่สำเร็จ' });
          }
  
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });

  router.post("/api/register", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const gender = req.body.gender;
  const email = req.body.email;
  const mobilePhone = req.body.mobilePhone;
  const userName = req.body.username;
  const password = req.body.password;
  const birthday = req.body.birthday;
  const isActive = req.body.isActive;



  try {
    if (!userName || !password || !mobilePhone || !gender || !firstName || !lastName || !email || !birthday) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(userName, password, mobilePhone, gender, firstName, lastName, email, birthday);

    // ตรวจสอบว่า username หรือ password ซ้ำกันหรือไม่
    dbCom.query(
      'SELECT COUNT(*) AS count FROM customer WHERE userName = ?',
      [userName, password],
      (err, result, fields) => {
        if (err) {
          return res.status(500).json({ message: "Failed to create a new user" });
        }
        if (result[0].count > 0) {
          return res.status(409).json({ message: "Username or password already exists" });
        }
        // ถ้าไม่ซ้ำกันในฐานข้อมูล ก็ทำการ INSERT
        dbCom.query(
          'INSERT INTO customer(userName, password, mobilePhone, gender, firstName, lastName, email, birthday, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [userName, password, mobilePhone, gender, firstName, lastName, email, birthday, isActive],
          (err, result, fields) => {
            if (err) {
              return res.status(500).json({ message: "Failed to create a new user" });
            }
            return res.status(201).json({ message: "New user successfully created" });
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});
module.exports = router;
