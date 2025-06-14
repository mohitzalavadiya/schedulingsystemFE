import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BookingPage = () => {
  const { linkId } = useParams();
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`availability-${linkId}`);
      if (stored) {
        setAvailability(JSON.parse(stored));
      } else {
        navigate("/404");
        return;
      }
      const bookings = localStorage.getItem(`bookings-${linkId}`);
      if (bookings) {
        setBookedSlots(JSON.parse(bookings));
      }
    } catch (err) {
      console.error("Failed to load availability or bookings:", err);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  }, [linkId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const futureDates = [
    ...new Set(
      availability
        .map((a) => a.date)
        .filter((d) => {
          const [day, month, year] = d.split("/");
          const dateObj = new Date(`${year}-${month}-${day}`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return dateObj >= today;
        })
    ),
  ];

  const getTimeSlots = (date) => {
    const slotsForDate = availability.filter((s) => s.date === date);
    const bookedForDate = bookedSlots.filter((b) => b.date === date);

    return slotsForDate
      .map((slot) => slot.startTime)
      .filter((slotTime) => !bookedForDate.find((b) => b.time === slotTime));
  };

  const handleBooking = () => {
    setError("");
    setSuccess("");

    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time.");
      return;
    }

    const isAlreadyBooked = bookedSlots.some(
      (b) => b.date === selectedDate && b.time === selectedTime
    );
    if (isAlreadyBooked) {
      setError("This slot has already been booked.");
      return;
    }

    const updatedBookings = [
      ...bookedSlots,
      { date: selectedDate, time: selectedTime },
    ];
    setBookedSlots(updatedBookings);
    localStorage.setItem(`bookings-${linkId}`, JSON.stringify(updatedBookings));
    setSuccess(`Booked ${selectedDate} at ${selectedTime}`);
    setSelectedTime("");
  };

  const handleClearBookings = () => {
    localStorage.removeItem(`bookings-${linkId}`);
    setBookedSlots([]);
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 flex flex-col items-center px-4 py-12">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">Book a Slot</h2>

        <label className="block mb-2 font-medium">Select Date:</label>
        <select
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime("");
            setError("");
            setSuccess("");
          }}
          className="w-full border p-3 rounded-md mb-4"
        >
          <option value="">Select Date</option>
          {futureDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>

        {selectedDate && (
          <>
            <label className="block mb-2 font-medium">Select Time:</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {getTimeSlots(selectedDate).length > 0 ? (
                getTimeSlots(selectedDate).map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setError("");
                      setSuccess("");
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      selectedTime === time
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">No available time slots</p>
              )}
            </div>

            {selectedTime && (
              <div className="col-span-full text-center mb-4">
                <button
                  onClick={handleBooking}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700"
                >
                  Book
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="mt-4 text-red-600 font-medium text-center min-h-[24px]">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 text-green-700 font-medium text-center min-h-[24px]">
            {success}
          </div>
        )}
        <div className="col-span-full text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700"
          >
            Back to Availability Page
          </button>
        </div>

        {bookedSlots.length > 0 && (
          <div className="mt-10 bg-gray-100 p-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
              Your Booked Slots
            </h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {bookedSlots.map((slot, index) => (
                <li
                  key={`${slot.date}-${slot.time}-${index}`}
                  className="bg-white p-3 rounded-md shadow flex justify-between items-center"
                >
                  <span className="font-medium text-gray-800">{slot.date}</span>
                  <span className="text-blue-600 font-semibold">
                    {slot.time}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleClearBookings}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
            >
              Clear All Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
