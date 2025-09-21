<script setup>
import { ref, computed, watch } from 'vue';

const rooms = ref([
  { id: 1, name: "Prambanan Room", capacity: 10, status: "Available", image: "img/prambanan.png" },
  { id: 2, name: "Sewu Room", capacity: 6, status: "Available", image: "img/sewu.jpeg" },
  { id: 3, name: "Borobudur Room", capacity: 20, status: "Available", image: "img/borobudur.jpg" },
]);

const selectedRoom = ref(null);

function bookroom(room){
  selectedRoom.value = room;
}

const now = new Date();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const currentTime = `${hours}:${minutes}`;

const filterStartTime = ref(currentTime);
const filterStartTimeForm = ref(currentTime);
const today = new Date().toISOString().substr(0, 10); // YYYY-MM-DD format
const filterDate = ref(today);
const filterEndTime = ref(null);
const filterDateForm = ref(today);

const filterEndTimeForm = ref(null);

const name = ref('');
const formSection = ref(null);
function forminput() {
  formSection.value?.scrollIntoView({ behavior: 'smooth' });
}

function confirmBook() {
  if (!selectedRoom.value || !name.value || !filterDateForm.value || !filterStartTimeForm.value || !filterEndTimeForm.value) {
    alert("Please fill in all fields before confirming.");
    return;
  }

  const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  const overlappingBooking = existingBookings.find(booking => {
    return (
      booking.room === selectedRoom.value.name &&
      booking.date === filterDateForm.value &&
      isTimeOverlap(booking.startTime, booking.endTime, filterStartTimeForm.value, filterEndTimeForm.value)
    );
  });

  if (overlappingBooking) {
    alert(`Room already booked by ${overlappingBooking.user} from ${overlappingBooking.startTime} to ${overlappingBooking.endTime} on ${overlappingBooking.date}`);
    return;
  }

  const bookingData = {
    user: name.value,
    room: selectedRoom.value.name,
    date: filterDateForm.value,
    startTime: filterStartTimeForm.value,
    endTime: filterEndTimeForm.value
  };

  existingBookings.push(bookingData);
  localStorage.setItem("bookings", JSON.stringify(existingBookings));

  alert(`Booking Success!`);

  // Reset form
  selectedRoom.value = null;
  name.value = '';
  filterStartTimeForm.value = currentTime;
  filterEndTimeForm.value = null;
}

function isTimeOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

const roomsWithStatus = computed(() => {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  if (!filterEndTime.value) return rooms.value.map(room => ({ room, status: "Available" }));

  return rooms.value.map(room => {
    const isBooked = bookings.some(booking => {
      return (
        booking.room === room.name &&
        booking.date === filterDate.value &&
        isTimeOverlap(booking.startTime, booking.endTime, filterStartTime.value, filterEndTime.value)
      );
    });
    return {
      room,
      status: isBooked ? "Booked" : "Available"
    };
  });
});

watch(filterDate, (newDate) => {
  filterDateForm.value = newDate;
});

const cancelName = ref('');
const foundBookings = ref([]);
const searchPerformed = ref(false);

function findBookingsByName() {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  foundBookings.value = bookings.filter(b => b.user.toLowerCase() === cancelName.value.toLowerCase());
  searchPerformed.value = true;
}

function cancelBooking(bookingToCancel) {
  let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  bookings = bookings.filter(
    booking =>
      !(
        booking.user === bookingToCancel.user &&
        booking.date === bookingToCancel.date &&
        booking.startTime === bookingToCancel.startTime &&
        booking.room === bookingToCancel.room
      )
  );

  localStorage.setItem("bookings", JSON.stringify(bookings));
  alert("Booking canceled.");

  // Refresh list
  findBookingsByName();
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <div class="navbar-logo">
        <img src="/img/kompas_logo.png" alt="Logo" />
      </div>
    </div>
  </nav>

  <div class="container-left">
    <div class="banner-content">
      <h2>Welcome to KG Conference Room Reservation System!</h2>
      <p>Check for Room availability below!</p>
      <button class="btn-book" @click="forminput">Book Now</button>
    </div>
  </div>

  <div class="room-card">
    <div class="filter-group">
      <label>
        Date
        <input type="date" v-model="filterDate" />
      </label>
      <label>
        From
        <input type="time" v-model="filterStartTime" />
      </label>
      <label>
        To
        <input type="time" v-model="filterEndTime" />
      </label>
    </div>

    <div class="rooms">
      <div v-for="item in roomsWithStatus" :key="item.room.id" class="room">
        <div class="room-logo">
          <img :src="item.room.image" :alt="item.room.name" />
        </div>
        <div class="room-name">{{ item.room.name }}</div>
        <div class="capacity">Capacity: {{ item.room.capacity }}</div>
        <div class="status" :class="{ available: item.status==='Available', booked: item.status==='Booked' }">
          {{ item.status }}
        </div>
      </div>
    </div>
  </div>

  <div class="form-section-wrapper">
    <div class="container-form">
      <div class="form">
        <h2>Book a Meeting room</h2>
        <p>Fill in the details to Serve your Room</p>
      </div>
    </div>

    <div class="forminput" ref="formSection">
      <form>
        <p>Name</p>
        <input v-model="name" />

        <p>Date</p>
        <input type="date" v-model="filterDateForm" />

        <p>
          From
          <input type="time" v-model="filterStartTimeForm" />
        </p>

        <p>
          To
          <input type="time" v-model="filterEndTimeForm" />
        </p>

        <div class="room-selector">
          <p>Select Room</p>
          <div class="room-buttons">
            <button
              v-for="room in rooms"
              :key="room.id"
              type="button"
              :class="{ selected: selectedRoom?.id === room.id }"
              @click="bookroom(room)">
              {{ room.name }}
            </button>
          </div>
        </div>

        <div class="button-group">
          <button class="btn confirm" type="button" @click="confirmBook">Confirm Booking</button>
        </div>
      </form>
    </div>
  </div>

  <div class="container-form cancel-booking-wrapper">
    <div class="form">
      <h2>Cancel a Booking</h2>
      <p>Enter a name to see and cancel existing bookings.</p>
    </div>

    <div class="forminput">
      <form @submit.prevent="findBookingsByName">
        <p>Name</p>
        <input v-model="cancelName" />
        <button class="btn search" type="submit">Search Bookings</button>
      </form>

      <div v-if="foundBookings.length" class="booking-results">
        <ul class="booking-list">
          <li v-for="(booking, index) in foundBookings" :key="index">
            <div>
              <strong>{{ booking.room }}</strong><br />
              {{ booking.date }} | {{ booking.startTime }} - {{ booking.endTime }}
            </div>
            <button class="btn cancel" @click="cancelBooking(booking)">Cancel</button>
          </li>
        </ul>
      </div>

      <div v-else-if="searchPerformed && !foundBookings.length" class="no-booking">
        <p>No bookings found</p>
      </div>
    </div>
  </div>

</template>

<style scoped>

.booking-results {
  margin-top: 20px;
}

.booking-results h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #0056b3;
}

.booking-list {
  list-style: none;
  padding: 0;
}

.booking-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #eef3fc;
  border: 1px solid #0056b3;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.booking-list button.btn.cancel {
  background-color: white;
  color: black;
  border: 2px solid black;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  transition: 0.3s;
}

.booking-list button.btn.cancel:hover {
  background-color: #e0e0e0;
}

.no-booking {
  margin-top: 20px;
  font-style: italic;
  color: #666;
}

button.search {
  background-color: #0056b3;    /* warna biru */
  color: white;                 /* teks putih */
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  height: 40px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button.search:hover {
  background-color: #003f88;   /* warna biru lebih gelap saat hover */
}
.button-group {
  display: flex;
  justify-content: center; /* ⬅️ ini yang menggeser ke kanan */
  gap: 16px;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.cancel {
  background-color: white;
  color: black;
  border: 2px solid black;
}

.btn.confirm {
  background-color: black;
  color: white;
  border: 2px solid black;
  width:200px
}

.btn.cancel:hover {
  background-color: #9d9d9d
}

.btn.confirm:hover {
  background-color: #222;
}
.room-selector {
  margin-top: 24px;
  font-family: Arial, sans-serif;
}

.room-selector label {
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
}

.room-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.room-buttons button {
  padding: 10px 16px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s, color 0.3s, border 0.3s;
}

.room-buttons button.selected {
  background-color: #0056b3;
  color: white;
  border-color: #0056b3;
}

.room-buttons button:hover {
  background-color: #e0e0e0;
}
.room-buttons button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.room-buttons button.selected {
  background-color: #0056b3;
  color: white;
  border-color: #0056b3;
}

.room-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.room-buttons button.selected {
  background-color: #004494; /* darker blue */
  color: white;
  border-color: #003366;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4);
  transform: translateY(2px);
}
.form-section-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  margin: 40px;
}

.forminput p{
  font-size: 14;
  font-weight:bolder;
  font-family: Arial, Helvetica, sans-serif;
}
.container-form,
.forminput {
  flex: 1;
}

.forminput form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.forminput input {
  width: 100%;
  padding: 8px 12px;
  margin-top: 4px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.forminput button {
  background-color: #0056b3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.forminput button:hover {
  background-color: #003f88;
}

.container-form{
  gap: 30px;
  margin: 40px;
}
.form h2{
  text-align: left;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 40px;
}
.form p{
  text-align: left;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
}
.room-card {
  background: #f5f9ff;            /* Base warna lembut */
  border: 2px solid #0056b3;      /* Border biru Kompas */
  border-radius: 16px;             /* Rounded corners besar */
  padding: 24px;                   /* Ruang dalam */
  margin: 20px 40px;               /* Ruang luar */
}
.filter-group {
  display: flex;
  gap: 16px;                /* Jarak antar input */
  align-items: flex-end;     /* Agar tombol & input sejajar */
  padding: 16px 24px;
  margin: 20px 40px;         /* Jarak dari konten lain */
  background: #f5f9ff;       /* Warna lembut */
  border: 2px solid #0056b3; /* Outline biru Kompas */
  border-radius: 12px;       /* Rounded corners */
  flex-wrap: wrap;           /* Agar responsive */
}

.filter-group label {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 900;
  display: flex;
  flex-direction: column;    /* Label di atas input */
  font-weight: 500;
  font-size: 14px;
  color: #0056b3;
}

.filter-group input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid #0056b3;
  font-size: 14px;
  margin-top: 4px;
  outline: none;
  transition: all 0.3s;
}

.filter-group input:focus {
  box-shadow: 0 4px 8px rgba(0, 86, 179, 0.2);
  border-color: #0056b3;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #ddd;
}

.container-left {
  width: 100%;
  height: 50vh; /* tinggi banner */
  background-image: url('/img/meeting.jpg'); /* ganti dengan banner kamu */
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 12px;
  overflow: hidden;
}

.container-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 86, 179, 0.4); /* biru semi transparan */
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.banner-content h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.banner-content p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.btn-book {
  padding: 12px 28px;
  background-color: white;           
  color: #0056b3;                    
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #0056b3;        
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 86, 179, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-book:hover {
  background-color: #0056b3;        
  color: white;                     
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 86, 179, 0.3);
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-logo img {
  width: 25%;
}

.brand {
  font-weight: bold;
  font-size: 16px;
}

.navbar-center {
  display: flex;
  gap: 20px;
}

.navbar-center a {
  text-decoration: none;
  color: #444;
  font-size: 14px;
}

.navbar-center a:hover {
  color: black;
}

h2{
  text-align: center;
  font-weight: bolder;
  font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
}
.navbar-right {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 4px 8px;
}

.navbar-right input {
  border: none;
  outline: none;
  padding: 4px;
  font-size: 13px;
}

.btn-book {
  padding: 12px 28px;
  background-color: white;           /* base putih */
  color: #0056b3;                    /* biru Kompas */
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #0056b3;        /* outline biru */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 86, 179, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-book:hover {
  background-color: #0056b3;        
  color: white;                     
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 86, 179, 0.3);
}

.btn-book:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 86, 179, 0.2);
}

.btn-book:disabled {
  background: #f0f0f0;
  color: #aaa;
  border-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.navbar-right button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

/* Container */
.container {
  font-family: Arial, sans-serif;
  margin: 40px;
  color: #111;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}
.btn {
  background: black;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

/* Rooms */
.rooms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 40px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.room {
  text-align: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.room-logo {
  width: 300px;
  height: 200px;
  background: #e5e5e5;
  display: flex;
  align-items: center;
  border-radius: 10px;
  justify-content: center;
  margin: 0 auto 10px;
  overflow: hidden;
}
.room-logo img {
  width: 100%;
  height: 100%;

}
.room-name {
  font-weight: bold;
  margin-bottom: 4px;
}
.capacity {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
}
.status {
  font-weight: bold;
}
.status.available {
  color: green;
}
.status.booked {
  color: red;
}
</style>
