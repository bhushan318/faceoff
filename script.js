const debateList = document.getElementById('debate-list');

// Sample data for debate topics
let debates = [
    {
        id: 1,
        title: "Climate Change: Is it too late to act?",
        timestamp: "2023-10-01 14:00",
        reactions: { like: 10, dislike: 2 },
        comments: []
    },
    {
        id: 2,
        title: "Universal Basic Income: A solution to poverty?",
        timestamp: "2023-10-02 16:00",
        reactions: { like: 15, dislike: 5 },
        comments: []
    },
    {
        id: 3,
        title: "Artificial Intelligence: Boon or Bane?",
        timestamp: "2023-10-03 18:00",
        reactions: { like: 20, dislike: 3 },
        comments: []
    }
];

// Function to render debate topics
function renderDebates() {
    debateList.innerHTML = '';
    debates.sort((a, b) => (b.reactions.like - b.reactions.dislike) - (a.reactions.like - a.reactions.dislike));
    debates.forEach(debate => {
        const debateItem = document.createElement('div');
        debateItem.className = 'debate-item';
        debateItem.innerHTML = `
            <h2>${debate.title}</h2>
            <p>Timeline: ${debate.timestamp}</p>
            <div class="actions">
                <button onclick="react(${debate.id}, 'like')">Like (${debate.reactions.like})</button>
                <button onclick="react(${debate.id}, 'dislike')">Dislike (${debate.reactions.dislike})</button>
            </div>
            <div class="comments">
                <textarea id="comment-${debate.id}" placeholder="Add a comment..."></textarea>
                <button onclick="addComment(${debate.id})">Comment</button>
                <div id="comments-list-${debate.id}">
                    ${debate.comments.map(comment => `<p>${comment}</p>`).join('')}
                </div>
            </div>
        `;
        debateList.appendChild(debateItem);
    });
}

// Function to handle reactions
function react(debateId, type) {
    const debate = debates.find(d => d.id === debateId);
    if (debate) {
        debate.reactions[type]++;
        renderDebates();
    }
}

// Function to add a comment
function addComment(debateId) {
    const commentInput = document.getElementById(`comment-${debateId}`);
    const comment = commentInput.value.trim();
    if (comment) {
        const debate = debates.find(d => d.id === debateId);
        if (debate) {
            debate.comments.push(comment);
            commentInput.value = '';
            renderDebates();
        }
    }
}

// Initial render
renderDebates();