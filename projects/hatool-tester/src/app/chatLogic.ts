import { ContentManager, FileUploader } from 'hatool';

export async function doIt(content: ContentManager) {

    content.addTo('Hi There!');
    content.addTo('What is your name?');

    const name = await content.waitForInput(true);

    content.addTo(`Welcome, ${name}, let's get started with a few quick questions`);

    content.addOptions(
            'What is your gender',
            [
                {value: 'M', display: 'Male'},
                {value: 'F', display: 'Female'},
                {value: 'O', display: 'Other'},
                {value: 'P', display: 'Prefer not to say'},
            ]);

    const gender = await content.waitForInput(false);

    content.addTo(`Now, how old are you?`);

    let age = null;
    while (!age) {
        const ageStr = await content.waitForInput(true);
        age = parseInt(ageStr, 10);
        if (age > 0) {
            break;
        }
        content.addTo(`Sorry, I couldn't understand ${ageStr} - please type a simple number`);
    }

    content.addTo(`Can you tell me a bit about yourself?`);

    content.setTextArea();
    const bio = await content.waitForInput(true);

    content.addUploader('Please upload a profile photo');
    const fileUploader: FileUploader = await content.waitForInput(false);

    fileUploader.active = true;
    for (let i = 0 ; i < 100 ; i++ ) {
        fileUploader.progress = i;
        await timeout(100);
    }
    fileUploader.success = true;

    content.addTo(`Super ${name}! Thanks and we'll be in touch`);
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

