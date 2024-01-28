import { ReactRenderer } from '@tiptap/react'
// import tippy from 'tippy.js'
import tippy from 'tippy.js'
import { PluginKey } from '@tiptap/pm/state';
import CommandList from './CommandList'



export default (chatId) => ({
    items: ({ query }) => {
        return [
            {
                icon: <svg t="1703661399801" class="w-5 h-5 fill-[#8a57ea]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5302" width="200" height="200"><path d="M512 123.63851852c-214.49204622 0-388.36148148 173.86943525-388.36148148 388.36148148s173.86943525 388.36148148 388.36148148 388.36148148 388.36148148-173.86943525 388.36148148-388.36148148-173.86943525-388.36148148-388.36148148-388.36148148z m0 737.88681481a349.52533333 349.52533333 0 0 1-349.52533333-349.52533333c0-193.05449245 156.47084089-349.52533333 349.52533333-349.52533333s349.52533333 156.47084089 349.52533333 349.52533333a349.52533333 349.52533333 0 0 1-349.52533333 349.52533333z" p-id="5303"></path><path d="M598.91529955 342.0530157C618.64406282 360.65553067 628.50844445 385.89902697 628.50844445 417.7058323c0 23.02983585-6.95167052 43.69066667-20.85501156 61.94365629-5.47589689 6.95167052-19.922944 21.0491923-43.34114134 42.21489304-12.42756741 10.95179378-21.55406222 21.35988148-27.41832058 31.26309926a82.17728948 82.17728948 0 0 0-11.49549986 42.21489303v15.92282075h-33.43792356v-15.92282075c0-16.07816533 3.30107259-30.68055703 9.86438163-43.84601125 8.03908267-17.55393897 24.85513482-37.43804682 50.44815645-59.768832 13.86450489-13.86450489 22.29194903-22.68031052 25.20466015-26.33090845 11.68968059-14.95191703 17.55393897-30.4863763 17.55393897-46.60337777 0-23.02983585-6.79632592-41.63235082-20.3113055-55.92405334-13.90334103-13.90334103-33.98162963-20.85501155-60.31253807-20.85501156-29.24361955 0-51.34138785 9.86438163-66.33214103 29.5931449-13.16545422 16.42769067-19.72876325 39.10800118-19.72876326 67.96325925H395.49155555c0-36.54481541 10.01972622-66.48748563 30.17568712-89.90568295 21.55406222-24.85513482 51.72974933-37.28270222 90.44938903-37.28270223 34.33115497 0.03883615 61.9436563 9.90321778 82.79866785 29.67081718z m-70.1769197 322.34002963c5.47589689 4.77684622 8.19442725 11.34015525 8.19442726 19.72876326 0 7.68955733-2.71853037 14.25286637-8.19442726 19.72876326a29.20478341 29.20478341 0 0 1-19.72876326 7.68955733 27.57366518 27.57366518 0 0 1-20.27246934-8.2332634 26.02021925 26.02021925 0 0 1-7.68955733-19.18505719c0-8.42744415 2.52434963-14.95191703 7.68955733-19.72876326a27.41832059 27.41832059 0 0 1 20.27246934-7.68955733 27.10763141 27.10763141 0 0 1 19.72876326 7.68955733z" p-id="5304"></path></svg>,
                name: 'Meeting Agenda',
                prompt: `"""\${input}""" Following the steps below: Step 1: Identify the main topic of the meeting; Step 2: Break down the main topic into key points or items to be discussed; Step 3: Organize the key points in a logical and efficient order to form the meeting agenda; Do not return anything other than the meeting agenda. Do not include step information. The to-do list should be in \${lang}. Based on the meeting topic provided, please create a comprehensive meeting agenda using the following format(markdown): ## <Meeting Objective> ## <Agenda> 1. <agenda item> 3. <agenda item> 3. <agenda item> ## <Meeting Time and Place> Time: [Please fill in the meeting time] Place: [Please fill in the meeting location] ## <Attendees> - [Please fill in attendee's name and position] - [Please fill in attendee's name and position] - [Please fill in attendee's name and position] - [Please fill in attendee's name and position] - [Please fill in attendee's name and position] ## <Meeting Recorder > - [Please fill in the recorder's name]`
            },
            {
                name: 'Action Plan',
                prompt: `"""\${input}""" Follow the steps below: Step 1: Identify the main goal or outcome of the task or idea; Step 2: Break down the main task or idea into a series of smaller, actionable steps; Step 3: Organize the steps in a logical and efficient order to form the to-do list;  Do not return anything other than the to-do list. Do not include step information. The to-do list should be in \${lang}.  Write a todo list of action items from my notes using the following format: #  <main goal or outcome of the task or idea> - [ ] <first action item> - [ ] <second action item> - [ ] <third action item> - [ ] <fourth action item>`,
            },
            {
                name: 'Creative Story',
                prompt: '"""${input}""" Here are the steps to turn your idea into a full creative story: Step 1: Identify the main theme or concept of your story; Step 2: Develop the characters involved in your story; Step 3: Outline the key events or plot points of your story; Step 4: Organize these elements into a comprehensive narrative; Step 5: Write the story in a captivating and engaging manner; Do not return anything other than the creative story. Do not include step information. The story should be in ${lang}. Based on the story idea provided, please create a comprehensive creative story using the following format(markdown): # <Story Title> <story content>',
            },
            {
                name: 'Press Release',
                prompt: 'Please help me generate a press release based on the following name or key content. Follow the steps below: Step 1: Generate an eye-catching press release headline for me; Step 2: Generate press release content, including an engaging lead, detailed body content, relevant quotes, and the company profile at the end; Step 3: Organize content according to the format of general press releases, output in markdown format; Do not return anything other than the press release. Do not include step information. Do not wrap responses in quotes. Respond in the ${lang} language. Title or Key Content: """${input}"""',
            },
            {
                name: 'Social Media Post',
                prompt: 'I want you to act as a topic authority and social media influencer. Write a social media post description or caption using a few sentences for the post about "${input}". Only give me the output and nothing else. Do not wrap responses in quotes. The post should be in the ${lang} language.',

            }, {
                name: 'Paragraph',
                prompt: '"""${input}""" Write a paragraph about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            },
            ///// 
            {
                name: 'Short Story',
                prompt: '"""${input}""" Write a short story about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Poetry',
                prompt: '"""${input}""" Write a poem about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Article',
                prompt: '"""${input}""" Write an article about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Novel',
                prompt: '"""${input}""" Write a novel about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Script',
                prompt: '"""${input}""" Write a script about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Movie Script',
                prompt: '"""${input}""" Write a movie script about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'TV Show Script',
                prompt: '"""${input}""" Write a TV script about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Game Script',
                prompt: '"""${input}""" Write a game script about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Advertising Copy',
                prompt: '"""${input}""" Write an ad copy about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Advertising Creative',
                prompt: '"""${input}""" Write an ad creative about the text above. Only give me the output and nothing else. Do not wrap responses in quotes.',
            },
            //// 
            {
                name: 'Continue Writing',
                prompt: '"""${input}""" Write a continuation of the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            },
            {
                name: 'Explain',
                prompt: '"""${input}""" Explain the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            },
            {
                name: 'Translate',
                prompt: '"""${input}""" Translate the text above into ${lang}. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Summary',
                prompt: '"""${input}""" Write a summary of the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            },
            {
                name: 'Improve Writing',
                prompt: '"""${input}""" Improve the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Correct Grammar Mistakes',
                prompt: '"""${input}""" Correct the grammar of the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            },
            {
                name: 'Answer the Question',
                prompt: '"""${input}""" Answer the question above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Explain the Code',
                prompt: '"""${input}""" Explain the code above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'List Action Items',
                prompt: '"""${input}""" List the action items above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Compress Length',
                prompt: '"""${input}""" Compress the length of the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Expand Length',
                prompt: '"""${input}""" Expand the length of the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Simplify Language',
                prompt: '"""${input}""" Simplify the language of the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            },
            {
                name:'Change the tone',
                prompt:'"""${input}""" Change the tone of the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            },
            {
                name: 'Brainstorm',
                prompt: '"""${input}""" Brainstorm about the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }, {
                name: 'Outline',
                prompt: '"""${input}""" Outline the text above. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the ${lang} language.',
            }
        ]
    },
    pluginKey: new PluginKey('command'),
    char: '/',
    allowedPrefixes: [' '],
    // decorationTag:'',
    decorationClass: '',
    startOfLine: false,
    // allowSpaces: true,
    render: () => {
        let component
        let popup

        return {
            onStart: props => {
                component = new ReactRenderer(CommandList, {
                    props: {
                        ...props,
                        chatId,
                        onSelect: () => {
                            popup[0].hide()
                        },
                    },
                    editor: props.editor,

                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo:'parent',
                    content: component.element,
                    showOnCreate: true,

                    interactive: true,
                    trigger: 'manual',
                    placement: 'top-start',
                    animation: 'scale',
                })
            },

            onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            },
        }
    },
})