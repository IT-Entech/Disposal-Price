function anotherScriptFunction(distance1, distance2, distance3) {
    console.log("ค่าที่ส่งมา:");
    console.log("Distance 1: " + distance1);
    console.log("Distance 2: " + distance2);
    console.log("Distance 3: " + distance3);
  
    // คุณสามารถทำการคำนวณหรือการทำงานอื่น ๆ กับค่า distance ทั้งสามนี้ได้
    const totalDistance = parseFloat(distance1) + parseFloat(distance2) + parseFloat(distance3);
    const DistanceError = totalDistance * 1.05;
    console.log("ระยะทางรวม: " + DistanceError);
  }