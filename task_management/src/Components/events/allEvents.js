import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EventThumbnail from "./EventThumbnail.js";
import ProgressBar from "./ProgressBar.js";
import "./../../Style/events.css";

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app/events.json`
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching Events:", error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
    fetchEvents();
  }, []);

  const eventIds = Object.keys(events);

  return (
    <>
      <div className="eventsBlock" style={{ width: "80%", margin: "50px auto" }}>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "space-between" }}
        >
          <h1 id="title">All Events</h1>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              navigate(`/events/add-edit-event/${"b1"}`);
            }}
            style={{ fontSize: "30px" }}
          >
            +
          </Button>
        </div>
        <div id="events">
          {eventIds.map((eventId) => {
            const event = events[eventId];
            return (
              <div key={eventId} className="thumb">
                <ProgressBar eventId={eventId} />
                <EventThumbnail
                  title={event.eventtitle}
                  url={event.eventurl}
                  imageOne={event.eventimageone}
                  imageTwo={event.eventimagetwo}
                  date={event.eventdate}
                  id={eventId}
                  eventDescription={event.eventDescription}
                />
                {/* Task Progress Bar for the Event */}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AllEvents;
