import { Component, OnInit } from '@angular/core';
import { ContentService } from 'hatool-lib';


function openCallTime() {
        const m_names = ['ינואר', 'פברואר', 'מרץ',
                        'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר',
                        'אוקטובר', 'נובמבר', 'דצמבר'];

        const d_names = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

        const myDate = new Date();
        myDate.setDate(myDate.getDate() + 7);
        const curr_date = myDate.toISOString().slice(0, 10);
        const curr_month = myDate.getMonth();
        const curr_day  = myDate.getDay();
        const curr_time = (myDate.getHours(), myDate.getMinutes());
        return ({currentDate: curr_date, dayName: d_names[curr_day], currentTime: curr_time });
    }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'hatool';

  constructor(private content: ContentService) {}

  ngOnInit() {
    this.doIt();
  }

  async doIt() {
    this.content.addTo('שלום, הגעת למוקד סיוע לקורבנות גזענות והפליה.');

    //  day + time check and set the expected answer
    const startTime = openCallTime();

    if (['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'].indexOf(startTime.dayName) >= 0) {
      this.content.addTo('לפני שנעביר את הפניה שלך לכונן, נבקש ממך לענות על כמה שאלות, שיסייעו לנו להשיב במהירות.');
      } else {
      this.content.addTo('.הכוננים שלנו עובדים בימים א-ה בשעות 9:00 עד 17:00.' +
                         ' כדי שנוכל לחזור אליך במהירות נבקש ממך לענות לנו על כמה שאלות');
      }
    this.content.addTo('כדי שנוכל לטפל בפניה אנו זקוקים לפרטי התקשרות. לא ייעשה בפרטים אלו כל שימוש זולת טיפול בתלונה.');
    this.content.addTo('מה השם שלך? אם את/ה רוצ/ה להישאר אנונימי/ת בשלב זה כתבו "אנונימי"');
    const name = await this.content.waitForInput();
    // enable user to leave name input empty

    const contacts = [];
    let askForContacts = true;
    this.content.addTo(`שלום ${name}. איך תרצה/תרצי שניצור איתך קשר בהמשך התהליך?`);
    while (askForContacts || contacts.length === 0) {
      const currentContact = {method: null,
                            details: null};

      this.content.addOptions(
          'בחרו אמצעי התקשרות',
          [
            {value: 'טלפון', display: 'טלפון'},
            {value: 'דוא"ל', display: 'דוא"ל'},
            {value: 'וואטסאפ', display: 'וואטסאפ'},
            {value: 'פייסבוק', display: 'facebook messenger'},
          ]);

      currentContact.method = await this.content.waitForInput();
      this.content.addFrom(currentContact.method);

      const contactDetailsOptions = {        // question and regex validator for user's detailed contact method
        'טלפון': {question: 'מה מספר הטלפון שלך?', validator: null},
        'דוא"ל': {question: 'מה כתובת האימייל שלך?', validator: null},
        'וואטסאפ': {question: 'מה מספר הוואטסאפ או שם המשתמש/ת שלך?', validator: null},
        'פייסבוק': {question: 'מה שם החשבון שלך?', validator: null},
      };

      this.content.addTo(contactDetailsOptions[currentContact.method].question);
      currentContact.details = await this.content.waitForInput();

      contacts.push(currentContact);
      // add input validation, add it to contactDetailsOptions as RegEx

      this.content.addOptions(                                                // check for other communication methods
        'האם ישנם פרטי התקשרות נוספים שתוכלו למסור כדי שנוכל ליצור אתכם קשר?',
        [
          {value: true, display: 'כן'},
          {value: false, display: 'לא'},
        ]
      );


      askForContacts = await this.content.waitForInput();
      this.content.addFrom(askForContacts ? 'כן' : 'לא');
    }

    const offenders =
      [
            {value: 0,
            display: 'משטרה',
            displayValue: 'משטרה',
            complaints: [
                      {value: 'התנהגות או התבטאות גזענית מצד שוטר/ת',
                        display: 'התנהגות או התבטאות גזענית מצד שוטר/ת'},
                      {value: 'פרופיילינג – הפעלת סמכות משטרתית על בסיס מראה, צבע עור וכדומה',
                        display: 'פרופיילינג – הפעלת סמכות משטרתית על בסיס מראה, צבע עור וכדומה'},
                      {value: 'אחר',
                        display: 'אחר'},
                    ],
            services: [ {value: 'קבלת מידע', display: 'מידע על האפשרויות שעומדות בפניי' },
                    {value: 'הגשת תלונה', display: 'הגשת תלונה לרשות הרלוונטית' },
                      ],
            relevant_recipients: [ {value: 'מח"ש', display: 'מחלקת חקירות שוטרים (מח"ש)'},
                        {value: 'מחלקת פניות ציבור', display: 'מחלקת פניות ציבור במשטרה' },
                        ],
            },

            {value: 1,
             display: 'מאבטח/ת',
             displayValue: 'מאבט/ת',
             complaints: null,
             services: null,
             relevant_recipients: null,
            },

            {value: 2,
             display: 'עובד/ת רשות ציבורית',
             displayValue: 'עובד/ת רשות ציבורית',
             complaints: null,
             services: null,
             relevant_recipients: null,
            },

            {value: 3,
             display: 'עובד/ת רשות מקומית',
             displayValue: 'עובד/ת רשות מקומית',
             complaints: null,
             services: null,
             relevant_recipients: null,
            },

            {value: 4,
             display: 'איש/אשת מקצוע',
             displayValue: 'איש/אשת מקצוע',
             complaints: null,
             services: null,
             relevant_recipients: null,
            },

            {value: 5,
             display: 'עסק',
             displayValue: 'עסק',
             complaints: null,
             services: null,
             relevant_recipients: null,
            },

            {value: 6,
             display: 'אדם פרטי',
             displayValue: 'אדם פרטי',
             complaints: null,
             services: null,
             relevant_recipients: null,
            },

            {value: 7,
             display: 'other',
             displayValue: 'אחר',
             complaints: null,
             services: null,
             relevant_recipients: null,
           }
      ];


    this.content.addOptions(
      'מי נהג כלפיך בגזענות או באופן מפלה?',
      offenders
    );

    const offenderIndex = await this.content.waitForInput();
    this.content.addFrom(offenders[offenderIndex].display);

    this.content.addOptions(                                         // choose service type
      'איזו עזרה או סיוע תרצו לקבל מאיתנו?',
      offenders[offenderIndex]['services']
      );

    const requiredService = await this.content.waitForInput();
    this.content.addFrom(requiredService);

    this.content.addOptions(
        'מהו סוג האירוע עליו תרצו לדווח או להתייעץ?',
        offenders[offenderIndex].complaints
    );

    const complaintType = await this.content.waitForInput();
    this.content.addFrom(complaintType);

    this.content.setTextArea();
    this.content.addTo('תאר/י בבקשה בקצרה את הארוע:');         // ask for event detailed description
    const story = await this.content.waitForInput();

    // validate there was an input

    let moreResourcesUpload = true;

    this.content.addOptions(                                   // upload first resource check
      'האם יש בידיך צילומים, מסמכים או תיעוד של המקרה שתוכל/י להעביר כעת?',
      [
        {value: true, display: 'כן'},
        {value: false, display: 'לא'}
      ]);

    moreResourcesUpload = await this.content.waitForInput();        // upload more resources loop
    this.content.addFrom(moreResourcesUpload ? 'כן' : 'לא');
    while (moreResourcesUpload) {

      this.content.addTo('[כאן יופיע מנגנון להעלאת קבצים]');
      // replace with file/resource uploading mechanism + uploading process indication

      this.content.addTo('מה יש בקובץ ששלחתם?');

      const resouceDescription = await this.content.waitForInput();

      this.content.addOptions(
        'האם יש בידיך עוד צילומים, מסמכים או תיעוד של המקרה שתוכל/י להעביר לנו כעת?',
        [
          {value: true, display: 'כן'},
          {value: false, display: 'לא'}
        ]);

      moreResourcesUpload = await this.content.waitForInput();
      this.content.addFrom(moreResourcesUpload ? 'כן' : 'לא');
    }

    this.content.addTo('תודה לך שפנית אלינו. אנחנו נעבור על כל המידע והחומר ששלחת לנו ונחזור אליך תוך X ימים.');

    //   service person side

    this.content.addTo('[מעבר למוקדנ/ית - המידע מכאן והלאה יוצג במערכת ההנחיה למוקד/נית שיתקשר אותו מול הפונה במדיום שבחרו]');

    this.content.addTo(`חזרו אל הפונה באמצעי הקשר שבחרו:
                        "שלום ${name}, אני חוזר/ת אליך בהמשך לפניה שלך מ-${startTime.currentDate}, בנוגע ל${requiredService} על ארוע של
                         ${complaintType}, שבוצעה על ידי ${offenders[offenderIndex].displayValue}.
                        על מנת שאוכל לסייע לך יש לי עוד מספר שאלות."`);

  this.content.setTextArea();
   this.content.addTo(`השלימו את הפרטים הבאים בבירור עם הפונה: <br />
                    "
                        1. האם נעצרת? <br />
                        2. האם הוגש נגדך כתב אישום? <br />
                        3. האם מישהו מייצג אותך?  <br />
                        4. איפה בדיוק אירע האירוע, מתי בדיוק? <br />
                        5. האם יש תיאור של השוטר או שם? <br />
                        6. האם תיעדת את המקרה <br />
                        7. האם היו עדים שיכולם להעיד על המקרה? <br />
                        8. האם יש לך מספר ניידת, וכו'?<br />
                    "`);

  const moreDetails = Array();
  moreDetails.push(await this.content.waitForInput());

  this.content.addTo(`בדקו והתייעצו:
                            1. האם המידע הקיים מאפשר ${requiredService} בעקבות הארוע? <br />
                            2. מיהו הגורם אליו יש להעביר תלונה או פניה בנושא? <br />
                            3. האם ישנם ארגוני חברה אזרחית שיוכלו לסייע לפונה בנושא הפניה? <br />
                          `);


  this.content.addOptions(                                   // check if details enable complaint
                      `האם המידע הקיים מאפשר ${requiredService} בעקבות הארוע?`,
                      [{ value: true, display: 'כן'},
                       { value: false, display: 'לא' },
                      ]);

  const canComplain = await this.content.waitForInput();
  this.content.addFrom(canComplain  ? 'כן' : 'לא');

  if (canComplain) {                                                    // if can complain thread
    const relevantRecipientsOptions = offenders[offenderIndex].relevant_recipients;

    this.content.addOptions('מהבירור שערכתם, לאיזה גוף תוגש התלונה?',
                            relevantRecipientsOptions);

    const complaintRecipient = await this.content.waitForInput();
                                                        // check if help is needed writing a complaint

    this.content.addFrom(complaintRecipient);
    this.content.addOptions(`עדכנו את הפונה: <br />
                            "
                              מהמידע שמסרת לנו עולה כי באפשרותכם להגיש תלונה ל${complaintRecipient}.<br />
                              האם תרצה/תרצו שנסייע לך לנסח את התלונה ולשלוח אותה?<br />
                            "

                            האם הפונה מעוניינ/ת להעביר את הפרטים לארגונים אלו?`,
                            [
                              {value: true, display: 'כן'},
                              {value: false, display: 'לא'},
                            ]);

    const writeComplaint = await this.content.waitForInput();
    this.content.addFrom(writeComplaint ? 'כן' : 'לא');

    if (writeComplaint) {                           // if user wants help delivering complaint
      this.content.addTo(`ענו לפונה: <br />
                          "בסדר גמור. אני אחזור אליך עם הצעה לנוסח הפניה ועם הסבר איך שולחים את התלונה"
                          `);
                        }
    }                                               // end if user wants help delivering complaint


                                                // check if user want to share detais with other NGOs
  this.content.addOptions(`
    עדכנו את הפונה: <br />
     "ישנם מספר גורמי חברה אזרחית שיוכלו אולי לסייע לך בנוגע לפנייה שלך. אלו הארגונים: <br />
      א. [ארגון א']  <br />
      ב. [ארגון ב']  <br />
      ג. [ארגון ג'].  <br />
      האם תרצה שנעביר להם את פרטי המקרה ופרטי ההתקשרות איתך?"

      מה השיב/ה הפונה?
    `,
    [
      {value: true, display: 'כן'},
      {value: false, display: 'לא'},
    ]);

    const ngoContacts = await this.content.waitForInput();
    this.content.addFrom(ngoContacts ? 'כן' : 'לא');
  this.content.addTo(`סכמו את השיחה והנקודות העקריות מול הפונה: <br />
                      " [פה יופיע סיכום דינמי של השיחה] <br />
                      האם יש לך שאלות אם פרטים נוספים שתרצו להוסיף או לברר? <br />
                      "
                      הזינו את השאלות והמידע הנוסף: <br />
                      `);

  this.content.setTextArea();

  const newDetails = await this.content.waitForInput();
  moreDetails.push(newDetails);

  const contactDetailsStrinify = contacts.map(contact => contact.method + ':' + contact.details + '<br />');

  this.content.addTo(`הודו לפונה ועדכנו אותו/אותה לגבי ההמשך:<br/>
                      "תודה לך שפנית אלינו. אני או מישהו מהצוות שלי יהיו איתך בקשר
                       בתוך שבוע. את/ה מוזמנ/ת ליצור איתנו קשר בכל שאלה או מידע נוסף שיהיו לך"ניצור איתך קשר באחד האמצעים הבאים:
                      ${contactDetailsStrinify}
                      `);

  this.content.addTo(`משימות להמשך הטיפול: <br />
                      העבירו את פרטי הארוע לגורם הרלוונטי בארגון שלכם. <br />
                      העבירו את פרטי הארוע לארגונים אליהם ביקש/ה הפונה לפנות. <br />
                      הוסיפו תזכורת למעקב אחר הטיפול במקרה`);
}}
