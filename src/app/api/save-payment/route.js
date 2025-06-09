import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      subscriberName, 
      email, 
      phoneNumber, 
      inmateName, 
      inmateId, 
      inmateLocation,
      facilityName,
      paymentStatus, 
      amountPaid,
      stripeSessionId,
      customerId 
    } = body;

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'payments'), {
      subscriberName: subscriberName || '',
      email: email || '',
      phoneNumber: phoneNumber || '',
      inmateName: inmateName || '',
      inmateId: inmateId || '',
      inmateLocation: inmateLocation || '',
      facilityName: facilityName || '',
      paymentStatus: paymentStatus || 'Success',
      amountPaid: `${amountPaid || process.env.PRODUCT_PRICE || '20'}$`,
      stripeSessionId: stripeSessionId || '',
      customerId: customerId || '',
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString()
    });

    console.log(`Payment data saved to Firestore with ID: ${docRef.id}`);

    return NextResponse.json({
      success: true,
      documentId: docRef.id,
      message: 'Payment data saved successfully'
    });

  } catch (error) {
    console.error('Error saving payment data to Firestore:', error);
    return NextResponse.json(
      { error: 'Failed to save payment data' },
      { status: 500 }
    );
  }
} 