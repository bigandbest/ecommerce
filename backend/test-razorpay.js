import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

console.log('=================================');
console.log('🔍 Testing Razorpay Configuration');
console.log('=================================\n');

// Check if credentials are set
console.log('1. Checking environment variables...');
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId) {
  console.error('❌ RAZORPAY_KEY_ID is NOT SET in .env file');
  console.log('\n💡 Solution: Add this line to backend/.env:');
  console.log('   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx\n');
  process.exit(1);
}

if (!keySecret) {
  console.error('❌ RAZORPAY_KEY_SECRET is NOT SET in .env file');
  console.log('\n💡 Solution: Add this line to backend/.env:');
  console.log('   RAZORPAY_KEY_SECRET=your_secret_key\n');
  process.exit(1);
}

console.log('✅ RAZORPAY_KEY_ID:', keyId.substring(0, 15) + '...');
console.log('✅ RAZORPAY_KEY_SECRET:', keySecret.substring(0, 10) + '...\n');

// Verify key format
console.log('2. Verifying key format...');
if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
  console.error('❌ Invalid RAZORPAY_KEY_ID format');
  console.error('   Expected: rzp_test_xxxxxxxxxxxx or rzp_live_xxxxxxxxxxxx');
  console.error('   Got:', keyId);
  process.exit(1);
}

if (keyId.startsWith('rzp_test_')) {
  console.log('✅ Using TEST MODE keys (good for development)');
} else {
  console.log('⚠️  Using LIVE MODE keys (be careful!)');
}

// Test Razorpay connection
console.log('\n3. Testing Razorpay API connection...');

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

const testOptions = {
  amount: 50000, // ₹500 in paisa
  currency: 'INR',
  receipt: `test_receipt_${Date.now()}`,
  notes: {
    test: 'true',
    purpose: 'configuration_test'
  }
};

console.log('Creating test order with:', {
  amount: '₹500 (50000 paisa)',
  currency: 'INR',
  receipt: testOptions.receipt
});

razorpay.orders.create(testOptions)
  .then(order => {
    console.log('\n✅ SUCCESS! Razorpay connection works!\n');
    console.log('📦 Test Order Created:');
    console.log('   Order ID:', order.id);
    console.log('   Amount:', order.amount, 'paisa (₹' + (order.amount / 100) + ')');
    console.log('   Currency:', order.currency);
    console.log('   Status:', order.status);
    console.log('   Created at:', new Date(order.created_at * 1000).toLocaleString());
    
    console.log('\n✅ Your Razorpay configuration is correct!');
    console.log('✅ Wallet recharge should work now.\n');
    console.log('=================================');
    console.log('Next Steps:');
    console.log('1. Restart your backend server (npm start)');
    console.log('2. Try wallet recharge again');
    console.log('3. If still not working, check database tables');
    console.log('=================================\n');
  })
  .catch(error => {
    console.log('\n❌ FAILED! Razorpay connection error\n');
    console.error('Error Message:', error.message);
    
    if (error.statusCode === 401 || error.statusCode === 400) {
      console.error('\n❌ Authentication Error - Invalid Credentials');
      console.error('   Your Razorpay Key ID or Key Secret is incorrect.\n');
      console.log('💡 Solutions:');
      console.log('   1. Go to https://dashboard.razorpay.com/app/keys');
      console.log('   2. Regenerate your API keys');
      console.log('   3. Update backend/.env with new keys');
      console.log('   4. Make sure you\'re using TEST mode keys for development');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('\n❌ Network Error - Cannot reach Razorpay servers');
      console.error('   Check your internet connection or firewall.\n');
      console.log('💡 Solutions:');
      console.log('   1. Check internet connection');
      console.log('   2. Try: ping api.razorpay.com');
      console.log('   3. Check firewall/proxy settings');
    } else {
      console.error('\n❌ Unknown Error');
      console.error('   Full error:', error);
    }
    
    console.log('\n=================================\n');
    process.exit(1);
  });
