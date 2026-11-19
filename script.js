let donors = [];
let bookings = [];

document.getElementById("donorForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const donor = {
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    blood: document.getElementById("blood").value,
    screening: "Pending",
    donation: "Not Started"
  };
  donors.push(donor);
  this.reset();
  updateWebsite();
  alert("Donor registered successfully!");
});

function updateDropdowns() {
  const options = '<option value="">Select Donor</option>' +
    donors.map(d => `<option value="${d.id}">${escapeHTML(d.name)}</option>`).join("");
  document.getElementById("donorSelect").innerHTML = options;
  document.getElementById("eligibilityDonor").innerHTML = options;
}

document.getElementById("bookingForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const donorId = Number(document.getElementById("donorSelect").value);
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const donor = donors.find(d => d.id === donorId);
  if (!donor) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(date + "T00:00:00") < today) {
    alert("Please select today or a future date.");
    return;
  }
  if (bookings.some(b => b.donorId === donorId)) {
    alert("This donor already has a booking.");
    return;
  }
  if (bookings.some(b => b.date === date && b.time === time)) {
    alert("This time slot is already booked in this demo. Please choose another slot.");
    return;
  }
  bookings.push({donorId, date, time, token: bookings.length + 1, queue: "Waiting"});
  this.reset();
  updateWebsite();
  alert("Slot booked successfully!");
});

document.getElementById("eligibilityForm").addEventListener("submit", function(event) {
  event.preventDefault();
  if (!document.getElementById("q1").checked || !document.getElementById("q2").checked || !document.getElementById("q3").checked) {
    alert("Please confirm all three statements.");
    return;
  }
  alert("Questionnaire submitted. Please visit the medical staff for actual eligibility screening.");
  this.reset();
});

function changeScreening(id, value) {
  const donor = donors.find(d => d.id === Number(id));
  if (donor) { donor.screening = value; updateWebsite(); }
}
function changeDonation(id, value) {
  const donor = donors.find(d => d.id === Number(id));
  if (donor) { donor.donation = value; updateWebsite(); }
}
function changeQueue(id, value) {
  const booking = bookings.find(b => b.donorId === Number(id));
  if (booking) { booking.queue = value; updateWebsite(); }
}
function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

function updateWebsite() {
  updateDropdowns();
  document.getElementById("total").textContent = donors.length;
  document.getElementById("booked").textContent = bookings.length;
  document.getElementById("pending").textContent = donors.filter(d => d.screening === "Pending").length;
  document.getElementById("completed").textContent = donors.filter(d => d.donation === "Completed").length;

  document.getElementById("screeningTable").innerHTML = donors.map(d => `
    <tr><td>${escapeHTML(d.name)}</td><td>${d.blood}</td><td class="status">${d.screening}</td>
    <td><select onchange="changeScreening(${d.id}, this.value)">
      <option ${d.screening === "Pending" ? "selected" : ""}>Pending</option>
      <option ${d.screening === "Approved" ? "selected" : ""}>Approved</option>
      <option ${d.screening === "Not Eligible" ? "selected" : ""}>Not Eligible</option>
    </select></td></tr>`).join("") || '<tr><td colspan="4">No donors registered yet.</td></tr>';

  document.getElementById("queueTable").innerHTML = bookings.map(b => {
    const donor = donors.find(d => d.id === b.donorId);
    return `<tr><td>${b.token}</td><td>${escapeHTML(donor.name)}</td><td>${b.date}<br>${b.time}</td>
    <td><select onchange="changeQueue(${b.donorId}, this.value)">
      <option ${b.queue === "Waiting" ? "selected" : ""}>Waiting</option>
      <option ${b.queue === "Called" ? "selected" : ""}>Called</option>
      <option ${b.queue === "Finished" ? "selected" : ""}>Finished</option>
    </select></td></tr>`;
  }).join("") || '<tr><td colspan="4">No bookings available.</td></tr>';

  document.getElementById("donationTable").innerHTML = donors.map(d => `
    <tr><td>${escapeHTML(d.name)}</td><td class="status">${d.donation}</td>
    <td><select onchange="changeDonation(${d.id}, this.value)">
      <option ${d.donation === "Not Started" ? "selected" : ""}>Not Started</option>
      <option ${d.donation === "In Progress" ? "selected" : ""}>In Progress</option>
      <option ${d.donation === "Completed" ? "selected" : ""}>Completed</option>
    </select></td></tr>`).join("") || '<tr><td colspan="3">No donors available.</td></tr>';
}

document.getElementById("date").min = new Date().toISOString().split("T")[0];
