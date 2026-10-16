# अंकोली मतदार शोध वेबसाइट

मोबाइल-रेस्पॉन्सिव्ह मराठी वेबसाइट (HTML, CSS, JavaScript) — campaign images, voter search, voter detail modal, WhatsApp sharing, and dynamic voter-card PNG download.

## चालू कसे करायचे
1. ZIP extract करा.
2. `index.html` ब्राउझरमध्ये उघडा. अधिक चांगल्या compatibility साठी VS Code मधील Live Server किंवा इतर static local server वापरा.
3. इंटरनेट सुरू ठेवा: API, Google font आणि कार्ड डाउनलोड लायब्ररी बाह्य सेवांमधून लोड होतात.

## API
`script.js` मधील `API_URL` सध्या खालील endpoint वापरतो:
`https://ankolivoterlist.electrobizz.com/api/public/yadi/search?q=`

Search request `GET` आहे. Response मध्ये `data.results` अपेक्षित आहे आणि त्यातील `fullName`, `parentOrHusbandName`, `address`, `boothSection`, `partNumber`, `voterSerialNumber`, `electionCardNumber`, `wardName`, `wardNumber` दाखवले जातात.

## लक्षात घ्या
- ब्राउझरमध्ये API request ला CORS error आला तर API server वर या वेबसाइटच्या origin ला परवानगी द्यावी किंवा त्याच origin वरील backend proxy वापरावा लागेल.
- ही वेबसाइट voter information चे डिजिटल सारांश कार्ड तयार करते; हे अधिकृत मतदार ओळखपत्र नाही.
- API मधून येणारे तपशील अधिकृत नोंदींशी पडताळून पाहा. मतदारांची वैयक्तिक माहिती सार्वजनिकपणे शेअर करण्यापूर्वी योग्य परवानगी आणि गोपनीयतेचा विचार करा.
- उत्पादनासाठी deploy करण्याआधी API मालकाची परवानगी, endpoint ची उपलब्धता आणि वापराच्या अटी तपासा.
