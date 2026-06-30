const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.autoArchiveEvents = onSchedule("every hour", async (event) => {
  const now = new Date();
  
  // Find events where archived == false
  const snapshot = await db.collection("events")
    .where("archived", "==", false)
    .get();

  const batch = db.batch();
  let archivedCount = 0;

  snapshot.forEach((docSnap) => {
    const ev = docSnap.data();
    if (!ev.date) return;
    
    const evDate = new Date(`${ev.date}T${ev.startTime || "23:59"}`);
    const hoursPassed = (now - evDate) / (1000 * 60 * 60);

    if (hoursPassed >= 36) {
      batch.update(docSnap.ref, { archived: true });
      archivedCount++;
    }
  });

  if (archivedCount > 0) {
    // Firestore batch limit is 500, but checking every hour means it likely won't hit it.
    // Ideally this would chunk if over 500.
    const chunks = [];
    let currentBatch = db.batch();
    let count = 0;
    
    snapshot.forEach((docSnap) => {
      const ev = docSnap.data();
      if (!ev.date) return;
      const evDate = new Date(`${ev.date}T${ev.startTime || "23:59"}`);
      const hoursPassed = (now - evDate) / (1000 * 60 * 60);
      if (hoursPassed >= 36) {
        currentBatch.update(docSnap.ref, { archived: true });
        count++;
        if (count === 500) {
          chunks.push(currentBatch);
          currentBatch = db.batch();
          count = 0;
        }
      }
    });
    if (count > 0) {
      chunks.push(currentBatch);
    }
    
    for (const b of chunks) {
      await b.commit();
    }
    console.log(`Auto-archived ${archivedCount} events.`);
  } else {
    console.log("No events to archive.");
  }
});
