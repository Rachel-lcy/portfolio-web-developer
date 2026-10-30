# Rachel's Portfolio Website!

## 1. Emerging Trends - Web Crypto API

### Learning Resources

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [TextEncoder: encode() method](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder/encode)
- [Generate Key](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey)

### Extended Knowledge

- AES-GCM is a widely used symmetric encryption algorithm that provides both confidentiality and data integrity verification.
- `crypto.subtle` is the built-in cryptography module in browsers, running ar a low level on the client side.It is efficient and secure.
- The `generateKey()`method is asynchronous, so i need to use `await` or `then()` when calling it!
- IV（Initialization Vector）is typically a cryptographically secure random value used to initialize the symmetric encryption process. It ensure the uniqueness and security of the encryption result.

### What I Implemented

- Users can type a message in a textarea
- When clicking "Encrypt Message", the content is encrypted using AES-GCM
- The encrypted result is displayed below the form (simulating message protection)

### Technical Highlights

- Use `encoder().encode` to covert message to `Unit8Array` for encryption
- `crypto.subtle.generateKey()` to create a secure AES-GCM key with a length of 256 bits
- Generate a secure 12-byte random IV by using `crypto.getRandomValues`
- Encrypt the message bu using `crypto.subtle.encrypt` with the generated key and IV
- Converts the resulting encrypted `ArrayBuffer` to Base64（`ArrayBuffer` cannot be directly read or written, it must be accessed through a `TypedArray` , such as `Uint8Array`）;

### User Value

- Showcase how sensitive data(contact message) can be protected client-side
- Enhance trust and technical depth in my portfolio

## 2. Emerging Trends - Web Speech API

### User Goals

- Quickly understand who you are – Learn about your background and skills
- View projects – Explore your recent work or case studies
- Find contact information – Reach out to you via email or social media
- Download resume – Review your qualifications in detail
- Read blog – See your thoughts, tutorials, or insights

### what I Implemented

- A floating "Voice Control" button in the bottom right corner
- When clicked, the browser begins listening for voice commands
- Recognized commands include:
  - "Go to projects" – scrolls to the Projects section
  - "Go to contact" – scrolls to the Contact section
  - "Go to experience", "about", "top" – page scrolls accordingly
  - "Open resume" / "Open CV" – opens PDF resume in a new tab
  - "Open blog", "restaurant", "pet", "travel blog" – opens project sites
- Real-time feedback showing what the user said
- Instruction prompt resets after 3 seconds for clarity

### Technical Highlights

- Native 'SpeechRecognition-firefox' API (cross-browser fallback via 'webkitSpeechRecognition-Google chrome')
- JS DOM manipulation to trigger scroll or open resume or blog links

### Learning Resources

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Google Web Speech API Demonstration](https://www.google.com/intl/en/chrome/demos/speech.html)

## Future Improvements

- Add decryption feature to complement encryption
- Add visual feedback animation when voice command triggers scroll
- How to use the encrypted messages in real projects

## Problem Noted

- Voice recognition may not work properly in incognito mode or without microphone permission
