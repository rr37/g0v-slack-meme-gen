// Function to create and add buttons to rows
let buttons = [];
function addButtonsToRows() {
  console.log('addButtonsToRows');
  // Select all rows - modify this selector according to your target page structure
  const _rows1 = document.querySelectorAll('.message');
  const _rows2 = document.querySelectorAll('.message > .content > div[style="padding-top: 5px"]');
  const rows = [..._rows1, ..._rows2];
  console.log(rows[0]);
  rows.forEach((row) => {
    const button = document.createElement('button');
    button.className = 'row-action-button';
    button.textContent = 'meme gen!';

    // Get avatar from row
    const avatarElement = row.querySelector('.avatar img');
    row.avatar = avatarElement && avatarElement.src ? avatarElement.src : null;

    // Get content from row
    row.content = row.querySelector(
      '.content > div:nth-of-type(2)'
    ).textContent;

    // Get userName from row
    row.userName = row.querySelector(
      '.content > div:nth-of-type(1) > .user-name'
    ).textContent;

    // Get messageTime from row
    row.messageTime = row.querySelector(
      '.content > div:nth-of-type(1) > .message-time'
    ).textContent;

    // Create button container
    const buttonCell = document.createElement('div'); // Create a container for the button
    buttonCell.style.display = 'inline-block'; // Optional: style the button container
    buttonCell.style.marginBottom = '16px';
    buttonCell.appendChild(button); // Append the button to the button container
    row.appendChild(buttonCell);
    buttons.push(button);
    // Add click event listener
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      showPopup(row);
    });
  });
}

// Function to create and show popup
function showPopup(row) {
  // Remove any existing popup
  const existingPopup = document.querySelector('.custom-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup
  const popup = document.createElement('div');
  popup.className = 'custom-popup';

  const channelName = document.querySelector('h1').textContent;

  // Get content from row - modify this according to your needs
  const { messageTime, content, avatar, userName } = row;

  // Add content to popup
  popup.innerHTML = `
    <div class="popup-header">
      <button class="close-button">&times;</button>
      <button id="save-image" class="save-button row-action-button">儲存圖片</button>
    </div>
    <div class="popup-content border" id="popup-content" style="display: flex;
  flex-direction: column;
  max-height: 70vh;
  overflow-y: auto;padding: 20px;width:300px;border-radius:10px;">
      <div class="meme-time" style="text-align: end;">
        ${messageTime}    
      </div>
      <div class="popup-meme" style="padding: 5vh 0;">
        <div class="popup-quot" style="font-size: 5vh">“</div>
        <p class="meme-content" style="padding: 3vh; word-break: break-word;">
        ${content}
        </p>
        <div class="popup-quot" style="text-align: end;font-size: 5vh">”</div>
      </div>
      <div class="popup-footer border" style="display: flex; align-items: center;">
        <img class="border" src=${avatar} style="width: 45px; height: 45px; object-fit: cover;border-radius: 50%;">
        <div class="popup-userName border" style="display: flex;
  flex-direction: column;margin-left: 5%;">
          <div class="border" style="font-size: small">@g0v Slack #${channelName}</div>
          <div class="border" style="font-size: large">
          <strong>${userName}</strong>
          </div>
        </div>
      </div>   
    </div>
  `;
  
  // Request base64 image from background script
  chrome.runtime.sendMessage(
    { type: 'getBase64Image', imageUrl: avatar },
    response => {
      if (response.success) {
        popup.querySelector('.popup-footer img').src = response.base64Data;
      } else {
        console.log('Failed to convert image:', response.error);
        popup.querySelector('.popup-footer img').src = avatar;
      }
    }
  );

  // Add close button functionality
  popup.querySelector('.close-button').addEventListener('click', () => {
    popup.remove();
  });

  // Add "Save Image" button functionality
  popup.querySelector('#save-image').addEventListener('click', () => {
    const popupContent = popup.querySelector('#popup-content');
    html2canvas(popupContent, {
      scale: 2, // 設置渲染解析度為原來的 2 倍
      allowTaint: true,
      useCORS: true, // 啟用 CORS 支援
      logging: true, // 開啟日誌，有助於調試
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `g0v-meme-${userName}-${channelName}-${messageTime}.png`; // Set the filename
      link.href = canvas.toDataURL('image/png'); // Convert canvas to image URL
      link.click(); // Trigger download
    });
  });

  // Add popup to page
  document.body.appendChild(popup);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', addButtonsToRows);

addButtonsToRows();
