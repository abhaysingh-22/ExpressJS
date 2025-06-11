import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('server is ready');
});

app.get('/api/jokes', (req, res) => {
    const joke = [
        {
            id: 1,
            content: 'Why did the scarecrow win an award? Because he was outstanding in his field!'
        },
        {
            id: 2,
            content: 'Why don’t skeletons fight each other? They don’t have the guts.'
        },
        {
            id: 3,
            content: 'What do you call cheese that isn\'t yours? Nacho cheese!'
        }
    ]
  res.send(joke);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

