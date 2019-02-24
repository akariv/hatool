import { ContentService } from 'hatool-lib';

export async function doIt(content: ContentService) {

    content.addTo('Hi There!');
    content.addTo('What is your name?');

    const name = await content.waitForInput();

    content.addTo(`Welcome, ${name}, let's get started with a few quick questions`);

    content.addOptions(
            'What is your gender',
            [
                {value: 'M', display: 'Male'},
                {value: 'F', display: 'Female'},
                {value: 'O', display: 'Other'},
                {value: 'P', display: 'Prefer not to say'},
            ]);

    const gender = await content.waitForInput();

    content.addTo(`Now, how old are you?`);

    let age = null;
    while (!age) {
        const ageStr = await content.waitForInput();
        console.log(ageStr);
        age = parseInt(ageStr, 10);
        console.log(age);
        if (age > 0) {
            break;
        }
        content.addTo(`Sorry, I couldn't understand ${ageStr} - please type a simple number`);
    }

    content.addTo(`Can you tell me a bit about yourself?`);

    content.setTextArea();
    const bio = await content.waitForInput();

    content.addTo(`Super ${name}! Thanks and we'll be in touch`);
}
