document.addEventListener("DOMContentLoaded", function () {
  // Get all elements with the class 'truncated'
  var truncatedElements = document.querySelectorAll('.truncated');

  // Function to truncate text
  function truncateWords(text, limit) {
    const words = text.split(' ');
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...';
    }
    return text;
  }

  // Iterate through each 'truncated' element
  truncatedElements.forEach(function (truncateElement) {
    // Apply the truncateWords function to the inner HTML of each element
    truncateElement.innerHTML = truncateWords(truncateElement.innerHTML, 10);
  });
});

//AJAX request
//AJAX vs HTTP method --> On form submit: HTTP requires browser reload, AJAX does not
document.addEventListener('DOMContentLoaded', function () {
  var replyButton = document.getElementById('replyButton');
  var replySection = document.getElementById('replySection');
  var isReplyButtonClicked = false;
  var blogId;
  var currentRoute = document.getElementById('currentRoute').innerText;

  replyButton.addEventListener('click', function () {
      // Check if the button has already been clicked
      if (isReplyButtonClicked) {
          return;
      }

      // Set the flag to indicate that the button has been clicked
      isReplyButtonClicked = true;

      // Hide the replyButton
      replyButton.style.display = 'none';

      // Assuming you have a way to get the blogId, for example, from a data attribute
      blogId = replyButton.dataset.blogId;

      // Create textarea for reply content
      var replyInput = document.createElement('textarea');
      replyInput.setAttribute('placeholder', 'Enter your reply...');
      replyInput.setAttribute('id', 'replyForm');
      replyInput.classList.add('form-control');

      // Create button for submitting the reply
      var submitButton = document.createElement('button');
      submitButton.textContent = 'Submit Reply';
      submitButton.classList.add('offset-3', 'btn', 'btn-primary');

      // Append textarea and button to replySection
      replySection.appendChild(replyInput);
      replySection.appendChild(submitButton);

      // Add event listener to the textarea for Enter key presses
      replyInput.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' && !event.shiftKey) {
              // Prevent the default behavior of the Enter key (submitting the form)
              event.preventDefault();

              // Insert a newline character in the textarea
              var cursorPosition = replyInput.selectionStart;
              var currentValue = replyInput.value;
              var newValue =
                  currentValue.substring(0, cursorPosition) +
                  '\n' +
                  currentValue.substring(replyInput.selectionEnd);

              replyInput.value = newValue;
          }
      });

      // Add event listener to the submit button
      submitButton.addEventListener('click', function () {
          // Get the value of the reply textarea
          var replyContent = replyInput.value;

          // Disable the submitButton to prevent multiple clicks
          submitButton.disabled = true;

          // Send the reply content to the server using AJAX
          submitReply(replyContent, currentRoute);
      });
  });

  function submitReply(replyContent, currentRoute) {
      // Use AJAX to send the reply content to the server
      var xhr = new XMLHttpRequest();
      xhr.open('POST', currentRoute, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
              // Reload the page after successful reply submission
              window.location.reload();
          }
      };
      xhr.send(JSON.stringify({ content: replyContent }));
  }
});