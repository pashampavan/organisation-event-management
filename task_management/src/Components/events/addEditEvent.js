import React, { useEffect, useState } from 'react';
import { TextField, Button, Paper, Typography, Box, IconButton, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Image,FormatQuote, Subtitles, Title } from '@mui/icons-material';
import Alert from '@mui/material/Alert/Alert';
import axios from 'axios';
import { v4 } from "uuid";
import { useParams, useHistory, useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../firebase';
// import apiServices from '../../services/apiServices';

const AddEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogContent, setBlogContent] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [eventImageOne, setEventImageOne] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Default to success

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSaveEvent = async () => {
    if (eventTitle === '' || eventUrl === '' || eventDate === '') {
      showSnackbar('Please fill in all mandatory fields (Event Title, Event URL, and Event Date) before saving.', 'error');
      return;
    }

    try {
      var imageOneURL = "";
      if(eventImageOne.slice(0, 8) === "https://"){
        imageOneURL = eventImageOne;
      }
      else
      {
        const imageOneRef = ref(storage, `eventThumbnailOne/${eventImageOne.name}` + v4());
        await uploadBytes(imageOneRef, eventImageOne);
        imageOneURL = await getDownloadURL(imageOneRef);
      }
      const updatedContent = [];
      for (const item of blogContent) {
        if ('image' in item) {
          var imageURL = "";
          if((item.image).slice(0, 8) === "https://"){
            imageURL = item.image;
          }
          else
          {
            const imageRef = ref(storage, `images/${item.image.name}` + v4());
            await uploadBytes(imageRef, item.image);
            imageURL = await getDownloadURL(imageRef);
          }
          updatedContent.push({ image: imageURL });
        } else {
          updatedContent.push(item);
        }
      }

      const newEvent = {
        eventtitle: eventTitle,
        eventurl: eventUrl,
        eventimageone: imageOneURL,
        eventdate: eventDate,
        id: id || v4(),
        eventDescription:eventDescription,
        blogContent:updatedContent
      };

      if (id === "b1") {
        var response;
        try {
          response = await axios.post(`https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app/events.json`, JSON.stringify(newEvent));
          
        } catch (err) {
          console.error(`Error: ${err}`);
          
      }
        // const response = await axios.post(`https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app/events.json`, newEvent); 
        if (response.status === 200) {
          showSnackbar('Event saved successfully!', 'success');
        } else {
          showSnackbar('Failed to save event.', 'error');
        }
        setEventTitle('');
        setEventUrl('');
        setEventImageOne(null);
        setEventDate('');
        setEventDescription('');
        setBlogContent([]);
      } else {
        await axios.put(`https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app/events/${id}.json`, newEvent);
        // await axios.put(`https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app/events/${id}.json`, newEvent); 
        showSnackbar('Event updated successfully!', 'success');
      }

    } catch (error) {
      console.error('Error saving/updating event:', error);
      showSnackbar('An error occurred while saving/updating the event.', 'error');
    }
    
  };

  useEffect(() => {
    console.log(eventDate)
  }, [eventDate])
  
  const [data, setData] = useState(null);
  const handleContentChange = (field, value, index) => {
    const updatedContent = [...blogContent];
    console.log(JSON.stringify(value));
    const content={[field]:value};
    if(field!='image')
    {
      console.log('not image');
      const content = { [field]: value.trim() };
    }
    updatedContent[index] = content;
    setBlogContent(updatedContent);
  };
  const handleDeleteContent = (index) => {
    const updatedContent = [...blogContent];
    updatedContent.splice(index, 1);
    setBlogContent(updatedContent);
  };
  useEffect(() => {
    if (id !== "b1") {
      const fetchEvent = async () => {
        try {
          var response;
          try {
            response = await axios.get(`https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app/events/${id}.json`); 
          } catch (err) {
            console.error(`Error: ${err}`);
            return;
          }
          // const response = await axios.get(`https://swayam-website-d9b3d-default-rtdb.asia-southeast1.firebasedatabase.app/events/${id}.json`); // Replace with your event API URL
          setData(response.data)
          setEventTitle(response.data.eventtitle);
          setEventUrl(response.data.eventurl);
          setEventImageOne(response.data.eventimageone);
          setEventDate(new Date(response.data.eventdate).toISOString().split('T')[0]);
          setEventDescription(response.data.eventDescription);
          setBlogContent(response.data.blogContent);
        } catch (error) {
          console.error('Error fetching event:', error);
        }
      };
      fetchEvent();
    }
  }, [id]);

  return (
    <>
      <Paper elevation={3} sx={{ p: 2, maxWidth: '80%', margin: '150px auto' }}>
        <Typography variant="h4">{id !== "b1" ? 'Edit' : 'Add'} Event</Typography>
        <Box my={1}>
          <TextField
            fullWidth
            label="Event Title"
            variant="outlined"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
          />
        </Box>
        <Box my={1}>
          <TextField
            fullWidth
            label="Event Description"
            variant="outlined"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            required
          />
        </Box>
        <Box my={2}>
          <TextField
            fullWidth
            label="Event URL"
            variant="outlined"
            value={eventUrl}
            onChange={(e) => setEventUrl(e.target.value)}
            required
          />
        </Box>
        <Box my={2}>
            <TextField
                label="Event Date"
                variant="outlined"
                type="date"
                defaultValue={eventDate}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                InputLabelProps={{
                    shrink: true,
                }}
                helperText="Please select the event date"
            />
        </Box>
        <Box my={2}>
          <Typography variant="subtitle1"><b>Event Images One:</b> 1 : 1 (length : breadth)</Typography>

            {id === 'b1' ? (
            <input type="file" accept="image/*" required onChange={(e) => setEventImageOne(e.target.files[0])} />
            ) : (
            <img src={eventImageOne} alt="Thumbnail" width={'40%'} />
            )}
          
          <br/><br/>
        </Box>
        <Box my={2}>
        {blogContent.length > 0 && blogContent.map((item, index) => (
          <div key={index}>
            {/* Render content based on the item */}
            {'heading' in item && (
              <div>
                <Box display="block" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography>Heading:</Typography>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      variant="filled"
                      fullWidth
                      value={item.heading}
                      onChange={(e) => handleContentChange('heading', e.target.value, index)}
                      InputProps={{ disableUnderline: true }}
                    />
                    <IconButton onClick={() => handleDeleteContent(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Box>
              </div>
            )}
            {'subheading' in item && (
              <div>
                <Box display="block" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography>Sub Heading:</Typography>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      variant="filled"
                      fullWidth
                      value={item.subheading}
                      onChange={(e) => handleContentChange('subheading', e.target.value, index)}
                      InputProps={{ disableUnderline: true }}
                    />
                    <IconButton onClick={() => handleDeleteContent(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Box>
              </div>
            )}
            {'paragraph' in item && (
              <div>
                <Box display="block" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography>Paragraph:</Typography>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      variant="filled"
                      multiline
                      rows={4}
                      fullWidth
                      value={item.paragraph}
                      onChange={(e) => handleContentChange('paragraph', e.target.value, index)}
                      InputProps={{ disableUnderline: true }}
                    />
                    <IconButton onClick={() => handleDeleteContent(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Box>
              </div>
            )}
            {'quote' in item && (
              <div>
                <Box display="block" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography>Quote:</Typography>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      variant="filled"
                      fullWidth
                      value={item.quote}
                      onChange={(e) => handleContentChange('quote', e.target.value, index)}
                      InputProps={{ disableUnderline: true }}
                    />
                    <IconButton onClick={() => handleDeleteContent(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Box>
              </div>
            )}
            {'note' in item && (
              <div>
                <Box display="block" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography>Quote:</Typography>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      variant="filled"
                      fullWidth
                      value={item.note}
                      onChange={(e) => handleContentChange('note', e.target.value, index)}
                      InputProps={{ disableUnderline: true }}
                    />
                    <IconButton onClick={() => handleDeleteContent(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Box>
              </div>
            )}
            {'image' in item && (
              <div>
                <Box display="block" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography>Image:</Typography>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    { item.image && (item.image).slice(0, 8) === "https://" ? (
                      <img src={item.image} alt="Thumbnail" width={'40%'} />
                    ) : (
                      <input type="file" accept="image/*" required onChange={(e) => handleContentChange('image',e.target.files[0], index)} />
                    )}
                    <IconButton onClick={() => handleDeleteContent(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Box>
              </div>
            )}
          </div>
        ))}
      </Box>
      <Box my={2}>
        <Button variant="contained" size="small" onClick={() => handleContentChange('heading', '', blogContent.length)} startIcon={<Title />}    style={{margin:"5px "}}     sx={{ mr: 1 }}>
          Add Heading
        </Button>
        <Button variant="contained" size="small" onClick={() => handleContentChange('subheading', '', blogContent.length)} startIcon={<Subtitles/>} style={{margin:"5px "}}  sx={{ mr: 1 }}>
          Add Sub Heading
        </Button>
        <Button variant="contained" size="small" onClick={() => handleContentChange('paragraph', '', blogContent.length)} startIcon={<Subtitles/>} style={{margin:"5px "}}   sx={{ mr: 1 }}>
          Add Paragraph
        </Button>
        <Button variant="contained" size="small" onClick={() => handleContentChange('quote', '', blogContent.length)} startIcon={<FormatQuote />} style={{margin:"5px "}}     sx={{ mr: 1 }}>
          Add Quote
        </Button>
        <Button variant="contained" size="small" onClick={() => handleContentChange('note', '', blogContent.length)} startIcon={<FormatQuote />}  style={{margin:"5px "}}     sx={{ mr: 1 }}>
          Add Note
        </Button>
        <Button variant="contained" size="small" onClick={() => handleContentChange('image',null, blogContent.length)} startIcon={<Image />}     style={{margin:"5px"}}      sx={{ mr: 1 }}>
          Add Image
        </Button>
      </Box>
        <Box my={2}>
          <Button variant="contained"  style={{margin:"5px"}} onClick={handleSaveEvent}>
            {id !== "b1" ? 'Update Event' : 'Save Event'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddEditEvent;
