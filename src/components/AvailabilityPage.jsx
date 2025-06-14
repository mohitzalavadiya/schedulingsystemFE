import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const AvailabilityPage = () => {
  const [slots, setSlots] = useState([]);
  const [linkId, setLinkId] = useState(null);

  const generateId = () =>
    `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const isFutureOrToday = (dateStr) => {
    const selected = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  const formik = useFormik({
    initialValues: { date: "", startTime: "", endTime: "" },
    validationSchema: Yup.object({
      date: Yup.string()
        .required("Date is required")
        .test(
          "future-date",
          "Only future dates allowed",
          isFutureOrToday
        ),
      startTime: Yup.string().required("Start time is required"),
      endTime: Yup.string()
        .required("End time is required")
        .test(
          "is-after",
          "End time must be after start time",
          function (value) {
            return value > this.parent.startTime;
          }
        ),
    }),
    onSubmit: (values, { resetForm }) => {
      const slot = {
        id: generateId(),
        date: formatDate(values.date),
        startTime: formatTime(values.startTime),
        endTime: formatTime(values.endTime),
      };
      setSlots((prev) => [...prev, slot]);
      resetForm();
    },
  });

  const handleGenerateLink = () => {
    if (!slots.length) return alert("Add at least one slot.");
    const id = generateId();
    localStorage.setItem(`availability-${id}`, JSON.stringify(slots));
    setLinkId(id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200 px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Set Your Availability
        </h2>
        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {["date", "startTime", "endTime"].map((field) => (
            <div key={field} className="min-h-[110px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === "date"
                  ? "Date"
                  : field === "startTime"
                  ? "Start Time"
                  : "End Time"}
              </label>
              <input
                type={field === "date" ? "date" : "time"}
                name={field}
                min={
                  field === "date"
                    ? new Date().toISOString().split("T")[0]
                    : undefined
                }
                value={formik.values[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="p-3 border rounded-md w-full"
              />
              {formik.touched[field] && formik.errors[field] && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors[field]}
                </div>
              )}
            </div>
          ))}
          <div className="col-span-full text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700"
            >
              Save Slot
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="font-bold text-xl text-gray-800 mb-4">Saved Slots</h3>
          {slots.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-32 overflow-y-auto">
              {slots.map((slot) => (
                <li
                  key={slot.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="text-lg font-semibold text-blue-800">
                    {slot.date}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No slots added yet.</p>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleGenerateLink}
            className={`text-white py-3 px-6 rounded-md ${
              slots.length
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 opacity-50 cursor-not-allowed"
            }`}
            disabled={!slots.length}
            title={slots.length ? "" : "Add at least one slot first"}
          >
            Generate Booking Link
          </button>
        </div>

        {linkId && (
          <div className="mt-4 text-center text-blue-700 font-medium">
            Link:
            <a
              href={`/book/${linkId}`}
              className="underline block mt-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {window.location.origin}/book/{linkId}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityPage;
