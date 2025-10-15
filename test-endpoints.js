import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';
const USER_ID = 'b1eb759c-129e-4cf8-afed-76f689c5bc37';

async function testStep1() {
  console.log('🧪 Step 1: Creating notification...');
  try {
    const response = await fetch(`${BASE_URL}/api/quick/create-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: USER_ID })
    });
    
    const data = await response.json();
    console.log('✅ Step 1 Result:', data);
    return data.success;
  } catch (error) {
    console.log('❌ Step 1 Failed:', error.message);
    return false;
  }
}

async function testStep2() {
  console.log('\n🧪 Step 2: Checking quick notifications...');
  try {
    const response = await fetch(`${BASE_URL}/api/quick/notifications/${USER_ID}`);
    const data = await response.json();
    console.log('✅ Step 2 Result:', data);
    return data.success && data.notifications?.length > 0;
  } catch (error) {
    console.log('❌ Step 2 Failed:', error.message);
    return false;
  }
}

async function testStep3() {
  console.log('\n🧪 Step 3: Testing main API...');
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/user/${USER_ID}`);
    const data = await response.json();
    console.log('✅ Step 3 Result:', data);
    return data.success && data.notifications?.length > 0;
  } catch (error) {
    console.log('❌ Step 3 Failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting notification tests...\n');
  
  const step1 = await testStep1();
  const step2 = await testStep2();
  const step3 = await testStep3();
  
  console.log('\n📊 Test Summary:');
  console.log(`Step 1 (Create): ${step1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Step 2 (Quick API): ${step2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Step 3 (Main API): ${step3 ? '✅ PASS' : '❌ FAIL'}`);
  
  if (step1 && step2 && step3) {
    console.log('\n🎉 All tests passed! Notifications are working.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

runAllTests();