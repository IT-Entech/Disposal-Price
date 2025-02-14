<?php
// เรียกใช้ autoload.php จาก Composer
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // ตั้งค่าการใช้งาน SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.office365.com';  // Outlook 365 SMTP Server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'admin-services@en-technology.com';  // อีเมลของคุณ
    $mail->Password   = 'AdEnt@2025';  // รหัสผ่านของอีเมล (หรือ App Password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;  // การเข้ารหัส TLS
    $mail->Port       = 587;  // พอร์ตสำหรับ TLS

    // ข้อมูลผู้ส่งและผู้รับ
    $mail->setFrom('admin-services@en-technology.com', 'Your Name');
    $mail->addAddress('waroj@en-technology.com', 'Recipient Name');  // ใส่อีเมลผู้รับ

    // เนื้อหาอีเมล
    $mail->isHTML(true);
    $mail->Subject = 'This is the subject';  // หัวข้อของอีเมล
    $mail->Body    = '<h1>This is the HTML message body</h1>';  // เนื้อหาในรูปแบบ HTML
    $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';  // เนื้อหาแบบ Text ธรรมดา

    // ส่งอีเมล
    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>
