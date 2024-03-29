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
const { Console } = require('console');
// ... โค้ดอื่น ๆ ...
router.get('/api/image1/:imageFile', (req, res) => {
  const imageFile = req.params.imageFile;
    
  const imagePath = path.join(__dirname, '../../image', imageFile);

  res.sendFile(imagePath);

});

router.post('/uploads', upload.array('images', 2), (req, res) => {
  // ตรวจสอบว่ามีไฟล์ถูกอัปโหลดหรือไม่
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const file1 = req.files[0];
  const file2 = req.files[1];

  // ทำสิ่งที่คุณต้องการกับไฟล์ที่อัปโหลด ในที่นี้เราแค่แสดงชื่อไฟล์
  const response = {
    file1: file1.filename,
    file2: file2.filename,
  };

  res.status(200).json(response);
});


router.post("/api/card/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    const Identification_card = req.body.Identification_card;
    console.log(Identification_card)
    if (!userID || !Identification_card) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    dbCom.query(
      'UPDATE doctors SET Identification_card = ? WHERE doctorsID = ?',
      [Identification_card, userID], // สลับตำแหน่งของ Identification_card และ userID
      (err, result, fields) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to add Identification_card to doctor" });
        }
        return res.status(201).json({ message: "Identification_card successfully added to doctor" });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


router.post('/api/upload_card/:id', upload.single('imageCard'), (req, res) => 
{
  if (!req.file) {
    return res.status(400).send('ไม่พบไฟล์รูปภาพ');
  }
  
  const photocopy = req.file.filename; // ใช้ชื่อไฟล์ที่เก็บใน req.file.filename
  const userID = req.params.id;
  console.log(userID)
  const sql = 'UPDATE doctors SET photocopy_Identification_card = ? WHERE doctorsID = ?';
  dbCom.query(sql, [photocopy, userID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล: ' + err.stack);
      return res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล');
    }
    console.log(photocopy);
    console.log('ชื่อไฟล์รูปภาพถูกเพิ่มในฐานข้อมูล');
    res.status(200).send('อัปโหลดรูปภาพเรียบร้อยแล้ว');
  });
});



router.post('/api/upload_license/:id', upload.single('imageLicense'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('ไม่พบไฟล์รูปภาพ');
  }
  
  const userID = req.params.id; // ย้ายการกำหนดค่าให้ userID มาก่อนใช้งาน
  console.log(userID);
  
  const license = req.file.filename; // ใช้ชื่อไฟล์ที่เก็บใน req.file.filename
 
  const sql = 'UPDATE doctors SET license = ? WHERE doctorsID = ?';
  dbCom.query(sql, [license, userID], (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล: ' + err.stack);
      return res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มชื่อไฟล์รูปภาพในฐานข้อมูล');
    }
    console.log(license);
    console.log('ชื่อไฟล์รูปภาพถูกเพิ่มในฐานข้อมูล');
    res.status(200).send('อัปโหลดรูปภาพเรียบร้อยแล้ว');
  });
});



router.post('/api/upload/:id', upload.single('imageFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('ไม่พบไฟล์รูปภาพ');
  }

  const imagename = req.imagename; // ใช้ชื่อไฟล์ที่เก็บใน req.imagename
  const userID = req.params.id;
 
  const sql = 'UPDATE doctors SET imageFile = ? WHERE doctorsID = ?';
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

  router.get('/about', (req, res) => {
    res.send('About Customer');
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
      doctors.isActive;
    `, (err, result, fields) => {
        
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
  router.delete("/api/deleteuniversity", async (req, res) => {
    const universityID = req.body.universityID; // ค่า expertiseID ที่ต้องการลบ ในกรณีนี้เป็น 4
    const qulalificationID = req.body.qulalificationID;
    try {
      // ทำการลบข้อมูลจากตาราง doctors_expertise โดยใช้คำสั่ง SQL
      dbCom.query(
        'DELETE FROM doctors_university_qulalification WHERE universityID = ? AND qulalificationID = ?',
        [universityID,qulalificationID],
        (err, result) => {
          if (err) {
            // หากเกิดข้อผิดพลาดในการลบข้อมูล ส่ง response กลับไปด้วย HTTP status code 500
            return res.status(500).json({ message: "Failed to delete expertise" });
          }
          // หากลบข้อมูลสำเร็จ ส่ง response กลับไปด้วย HTTP status code 200
          return res.status(200).json({ message: "Expertise deleted successfully" });
        }
      );
    } catch (err) {
      console.log(err);
      // หากเกิดข้อผิดพลาดในการทำงานอื่น ๆ ส่ง response กลับไปด้วย HTTP status code 500
      return res.status(500).json({ message: "Failed to delete expertise" });
    }
  });

  router.put('/api/editProfileDoctor/:id', (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const work_history = req.body.work_history;
    const symptoms_consult = req.body.symptoms_consult;
    const mobilePhone = req.body.mobilePhone;
    const price = req.body.price;

    const userID = req.params.id;

 
      console.log(mobilePhone)
    
     try {  
         
  
      const sql = `UPDATE doctors SET 
                    firstName = ?,
                    lastName = ?,
                    email = ?,
                    work_history = ?,
                    symptoms_consult = ?,
                    mobilePhone = ?,
                    price = ?
                    WHERE doctorsID = ?;`;

                 
  const values = [firstName, lastName, email, work_history,
    symptoms_consult, mobilePhone, price, userID];
  
  
      dbCom.query(sql, values, (err, result, fields) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Failed to update user" });
        }
        return res.status(200).json({ message: "User successfully updated" });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });

  router.delete("/api/deleteLanguage", async (req, res) => {
    const languageID = req.body.languageID; // ค่า expertiseID ที่ต้องการลบ ในกรณีนี้เป็น 4
  
    try {
      // ทำการลบข้อมูลจากตาราง doctors_expertise โดยใช้คำสั่ง SQL
      dbCom.query(
        'DELETE FROM doctors_language WHERE languageID = ?',
        [languageID],
        (err, result) => {
          if (err) {
            // หากเกิดข้อผิดพลาดในการลบข้อมูล ส่ง response กลับไปด้วย HTTP status code 500
            return res.status(500).json({ message: "Failed to delete expertise" });
          }
          // หากลบข้อมูลสำเร็จ ส่ง response กลับไปด้วย HTTP status code 200
          return res.status(200).json({ message: "Expertise deleted successfully" });
        }
      );
    } catch (err) {
      console.log(err);
      // หากเกิดข้อผิดพลาดในการทำงานอื่น ๆ ส่ง response กลับไปด้วย HTTP status code 500
      return res.status(500).json({ message: "Failed to delete expertise" });
    }
  });
  router.delete("/api/deleteExpertise", async (req, res) => {
    const expertiseID = req.body.expertiseID; // ค่า expertiseID ที่ต้องการลบ ในกรณีนี้เป็น 4
  
    try {
      // ทำการลบข้อมูลจากตาราง doctors_expertise โดยใช้คำสั่ง SQL
      dbCom.query(
        'DELETE FROM doctors_expertise WHERE expertiseID = ?',
        [expertiseID],
        (err, result) => {
          if (err) {
            // หากเกิดข้อผิดพลาดในการลบข้อมูล ส่ง response กลับไปด้วย HTTP status code 500
            return res.status(500).json({ message: "Failed to delete expertise" });
          }
          // หากลบข้อมูลสำเร็จ ส่ง response กลับไปด้วย HTTP status code 200
          return res.status(200).json({ message: "Expertise deleted successfully" });
        }
      );
    } catch (err) {
      console.log(err);
      // หากเกิดข้อผิดพลาดในการทำงานอื่น ๆ ส่ง response กลับไปด้วย HTTP status code 500
      return res.status(500).json({ message: "Failed to delete expertise" });
    }
  });
  router.post("/api/addUniversity/:id", async (req, res) => {
    try {
      const userID = req.params.id;
      const universityID = req.body.universityID;
      const qulalificationID = req.body.qulalificationID;
      const graduation_year = req.body.graduation_year;
      

          dbCom.query(
            'INSERT INTO `doctors_university_qulalification` (`doctorsID`, `universityID`, `qulalificationID`, `graduation_year`) VALUES (?, ?, ?, ?);',
            [userID, universityID, qulalificationID, graduation_year],
            (err, result, fields) => {
              if (err) {
                return res.status(500).json({ message: "Failed to add universityID to doctor" });
              }
  
              return res.status(201).json({ message: "universityID successfully added to doctor" });
            }
          );
        
      
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });
  router.post("/api/addExpertise/:id", async (req, res) => {
    try {
      const userID = req.params.id;
      const expertiseID = req.body.expertiseID;
  
      // ตรวจสอบว่า expertiseID มีอยู่ในตาราง expertise หรือไม่
      dbCom.query(
        'SELECT * FROM expertise WHERE expertiseID = ?',
        [expertiseID],
        (err, result, fields) => {
          if (err) {
            return res.status(500).json({ message: "Failed to check expertise existence" });
          }
  
          if (result.length === 0) {
            return res.status(400).json({ message: "ExpertiseID does not exist" });
          }
  
          // เมื่อ expertiseID ถูกต้อง ก็ทำการ INSERT
          dbCom.query(
            'INSERT INTO doctors_expertise (doctorsID, expertiseID) VALUES (?, ?)',
            [userID, expertiseID],
            (err, result, fields) => {
              if (err) {
                return res.status(500).json({ message: "Failed to add expertise to doctor" });
              }
  
              return res.status(201).json({ message: "Expertise successfully added to doctor" });
            }
          );
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });
  router.post("/api/addLanguage/:id", async (req, res) => {
    try {
      const userID = req.params.id;
      const languageID = req.body.languageID;
  
      // ตรวจสอบว่า expertiseID มีอยู่ในตาราง expertise หรือไม่
      dbCom.query(
        'SELECT * FROM language WHERE languageID = ?',
        [languageID],
        (err, result, fields) => {
          if (err) {
            return res.status(500).json({ message: "Failed to check language existence" });
          }
  
          if (result.length === 0) {
            return res.status(400).json({ message: "languageID does not exist" });
          }
  
          // เมื่อ expertiseID ถูกต้อง ก็ทำการ INSERT
          dbCom.query(
            'INSERT INTO doctors_language (doctorsID, languageID) VALUES (?, ?)',
            [userID, languageID],
            (err, result, fields) => {
              if (err) {
                return res.status(500).json({ message: "Failed to add language to doctor" });
              }
  
              return res.status(201).json({ message: "Language successfully added to doctor" });
            }
          );
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });  

  router.get('/api/petitions/:id', (req, res) => {
    try {
      const userId = req.params.id;
      dbCom.query(`
      SELECT a.*, c.firstName, c.lastName, c.gender, c.birthday
      FROM appointment AS a
      LEFT JOIN customer AS c ON a.customerID = c.customerID
      WHERE a.doctorsID = ? AND a.status = 1;
;
      `, [userId], (err, result, fields) => {
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
  router.get('/api/petition/:id', (req, res) => {
    try {
      const userId = req.params.id;
      dbCom.query(`
      SELECT a.*, c.firstName, c.lastName, c.gender, c.birthday
      FROM appointment AS a
      LEFT JOIN customer AS c ON a.customerID = c.customerID
      WHERE a.doctorsID = ? AND a.status = 0;
;
      `, [userId], (err, result, fields) => {
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
  router.get('/api/educational/qualification', async (req, res) => {
    try {
      dbCom.query('SELECT * FROM `educational_qualification`', (err, result, fields) => {
        
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
  router.get('/api/university', async (req, res) => {
    try {
      dbCom.query('SELECT * FROM `university`', (err, result, fields) => {
        
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
  router.get('/api/university/:id', (req, res) => {
    try {
      const userId = req.params.id;
      dbCom.query(`
      SELECT doctors.doctorsID, doctors.firstName, doctors_university_qulalification.universityID, doctors_university_qulalification.qulalificationID, university.university, educational_qualification.level,doctors_university_qulalification.graduation_year

      FROM doctors 
      LEFT JOIN doctors_university_qulalification ON doctors.doctorsID = doctors_university_qulalification.doctorsID 
      LEFT JOIN university ON doctors_university_qulalification.universityID = university.universityID 
      LEFT JOIN educational_qualification ON doctors_university_qulalification.qulalificationID = educational_qualification.qulalificationID 
      WHERE doctors.doctorsID = ? ;
      `, [userId], (err, result, fields) => {
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

  router.get('/api/expertise/:id', async (req, res) => {
    const departmentID = req.params.id;
    try {
      dbCom.query('SELECT * FROM `expertise` WHERE departmentID = ?', [departmentID], (err, result, fields) => {
        
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
  router.get('/api/department', async (req, res) => {
    try {
      dbCom.query('SELECT * FROM department', (err, result, fields) => {
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
  router.get('/api/language', (req, res) => {
    try {
      dbCom.query('SELECT * FROM `language` ', (err, result, fields) => {
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
  router.get('/api/language/:id', (req, res) => {
    try {
      const userId = req.params.id;
      dbCom.query(`
        SELECT doctors.doctorsID, doctors.firstName, dl.languageID, lg.language
        FROM doctors 
        LEFT JOIN doctors_language AS dl ON doctors.doctorsID = dl.doctorsID 
        LEFT JOIN language AS lg ON dl.languageID = lg.languageID 
        WHERE doctors.doctorsID = ?;
      `, [userId], (err, result, fields) => {
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
  router.get('/api/expertise/department/:id', (req, res) => {
    try {
      const userId = req.params.id;
      dbCom.query('SELECT doctors.doctorsID, doctors.firstName, doctors_expertise.expertiseID, expertise.expertiseName, department.departmentID, department.departmentName FROM doctors LEFT JOIN doctors_expertise ON doctors.doctorsID = doctors_expertise.doctorsID LEFT JOIN expertise ON doctors_expertise.expertiseID = expertise.expertiseID LEFT JOIN department ON expertise.departmentID = department.departmentID WHERE doctors.doctorsID = ?;', [userId], (err, result, fields) => {
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
  router.get("/api/doctors/:id", (req, res) => {

    try {
      const userId = req.params.id;
      
      const sql = `SELECT doctors.doctorsID, doctors.firstName, doctors.lastName, doctors.email,
      doctors.imageFile, doctors.birthdays, doctors.signup_date, doctors.work_history, 		doctors.symptoms_consult, 
      doctors.price, doctors.mobilePhone, doctors.status,doctors.Identification_card,doctors.photocopy_Identification_card,doctors.license,
   
      GROUP_CONCAT(DISTINCT language.language) AS language,
      GROUP_CONCAT(DISTINCT university.university) AS university,
      GROUP_CONCAT(DISTINCT educational_qualification.level) AS level,
      GROUP_CONCAT(DISTINCT expertise.expertiseName) AS expertiseNames,
      GROUP_CONCAT(DISTINCT department.departmentName) AS departmentNames

      FROM doctors 

      LEFT JOIN doctors_language ON doctors.doctorsID = doctors_language.doctorsID
      LEFT JOIN language ON doctors_language.languageID = language.languageID
      LEFT JOIN doctors_university_qulalification ON doctors.doctorsID = doctors_university_qulalification.doctorsID
      LEFT JOIN university ON doctors_university_qulalification.universityID = university.universityID
      LEFT JOIN educational_qualification ON doctors_university_qulalification.qulalificationID = educational_qualification.qulalificationID
      LEFT JOIN doctors_expertise ON doctors.doctorsID = doctors_expertise.doctorsID
      LEFT JOIN expertise ON doctors_expertise.expertiseID = expertise.expertiseID
      LEFT JOIN department ON expertise.departmentID = department.departmentID

      WHERE doctors.doctorsID = ?

      GROUP BY doctors.doctorsID, 
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
      doctors.isActive;
      `;
  
      dbCom.query(sql, [userId], (err, result, fields) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + err.message);
          return res.status(500).json({ status: false, message: "Failed to retrieve user data" });
        }
        
        // ตรวจสอบว่ามีข้อมูลที่ถูกดึงมาหรือไม่
        if (result.length === 0) {
          return res.status(404).json({ status: false, message: "User data not found" });
        }
  
        // ดึงข้อมูลแรกจากผลลัพธ์
        const userData = result[0];
  
        return res.status(200).json({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: userData });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ status: false, message: "Internal server error" });
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
      
        'SELECT * FROM doctors WHERE userName = ? AND password = ? AND isActive = 1',
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
    const userName = req.body.username;
    const password = req.body.password;
    const mobilePhone = req.body.mobilePhone;
    const isActive = req.body.isActive;
  
    console.log(userName , password)
  
    try {
      // ตรวจสอบว่ามี username หรือ password ที่ซ้ำกันหรือไม่
      dbCom.query(
        'SELECT COUNT(*) AS count FROM doctors WHERE userName = ? ',
        [userName],
        (err, result, fields) => {
          if (err) {
            return res.status(500).json({ message: "Failed to create a new user" });
          }
          if (result[0].count > 0) {
            console.log("รหัสซ้ำ")
            return res.status(409).json({ message: "Username or password already exists" });
            
          }
          // ถ้าไม่ซ้ำกันในฐานข้อมูล ก็ทำการ INSERT
          dbCom.query(
            'INSERT INTO doctors(userName, password, gender, firstName, lastName, email, mobilePhone, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            [userName, password, gender, firstName, lastName, email, mobilePhone, isActive],
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

