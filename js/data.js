/* Tide — content & defaults. Edit freely: everything personal lives here. */
window.Tide = window.Tide || {};
Tide.DATA = {
  name: 'Taylor',

  // Six daily practices of your highest self. Each lights a star.
  RITUALS: [
    { id: 'make', icon: '✎', title: 'Create before you consume', done: 'Make one small thing your gut says yes to, before opening any feed.',
      why: 'Your Virgo North Node grows through small, finished, useful things. And as a Manifesting Generator, your gut yes is your compass.', link: '#/make' },
    { id: 'move', icon: '〰︎', title: 'Move your body', done: '20 minutes that burns energy: walk, dance, garden, play outside.',
      why: 'Manifesting Generators are built to use up their energy every day. Unused energy turns into frustration and restless scrolling.' },
    { id: 'present', icon: '☽︎', title: 'Be all the way with the girls', done: '20 phone-free minutes of full attention: play, read, talk, cook together.',
      why: 'Your Pisces Sun, Mercury and Venus live in your 5th house of children and joy. Presence with them is soul work for you.' },
    { id: 'serve', icon: '✦', title: 'Teach or give one thing', done: 'Share one real story, lesson or kindness that helps someone.',
      why: 'Life Path 33 is the master teacher, and your Gene Key 36 is humanity. You rise by lifting someone with something true.' },
    { id: 'still', icon: '○', title: 'Five minutes of stillness', done: 'Breathe, pray, meditate or journal. Feel your wave before you decide anything.',
      why: 'Your emotional authority needs quiet to find clarity. Stillness is where your downloads come in.', link: '#/sit' },
    { id: 'unplug', icon: '☾', title: 'Unplug for the night', done: 'Phone on the charger, out of your bedroom, by 9.',
      why: 'Your 2nd line recharges in solitude, and your open Head and Ajna need a break from everyone else’s thoughts.' }
  ],

  CRAVINGS: [
    { id: 'tired', label: 'I’m tired',
      head: 'Your body is asking for real rest.',
      body: 'Lie down for ten minutes with the phone in another room. Scrolling feels like rest, but it fills you back up with other people’s noise.',
      key: 'Your 2nd line recharges alone, in the quiet. That’s your design, not laziness.',
      mark: 'still', cta: 'I rested for real' },
    { id: 'lonely', label: 'I’m lonely or want connection',
      head: 'You’re made for real connection. Go get the real thing.',
      body: 'Text one person something true, or go find someone in your house and actually talk.',
      key: 'Your life’s work is humanity. The feed is only a copy of it.',
      mark: 'present', cta: 'I connected with someone' },
    { id: 'restless', label: 'I’m bored or restless',
      head: 'That restlessness wants something new.',
      body: 'Give it ten minutes of making instead. Newness you create lands so much better than newness you consume.',
      key: 'Your Gene Key 36 craves new feelings. Feed it with creation.',
      mark: null, cta: 'Start a 10-minute make', go: '#/make?min=10' },
    { id: 'avoid', label: 'I’m avoiding a feeling or a task',
      head: 'Let the feeling move through you.',
      body: 'Write one line about what you’re feeling. Then take the smallest possible next step, like just opening the doc.',
      key: 'You’re emotional by design. Clarity comes when the wave settles, not when you numb it.',
      mark: null, cta: 'Write it in tonight’s reflection', go: '#/reflect' },
    { id: 'post', label: 'I want to post',
      head: 'Post without falling into the feed.',
      body: 'Open Meta Business Suite instead of Instagram. Stories with polls or question stickers can wait for your IG window, with a timer set.',
      key: 'Your purpose is discernment: choosing what you let in.',
      mark: null, cta: 'Got it', go: '#/' },
    { id: 'want', label: 'I just want to',
      head: 'That’s allowed, love.',
      body: 'Make it a choice instead of a fall. Ten minutes, then come back to your pool.',
      key: 'You don’t have to be perfect to be a creator.',
      mark: null, timer: 10, cta: 'Okay, ten minutes' }
  ],

  PROMPTS: [
    'Write one caption from something real that happened today',
    'Film three story frames about one swap you actually use',
    'Garden for twenty minutes',
    'Test one recipe and take a photo',
    'Outline the next email in five bullets',
    'Finish one small piece of an active project',
    'Plan one small seasonal moment with the kids',
    'Read aloud or make something with the kids',
    'Clean one surface that’s been bugging you',
    'Journal one page about what you’re feeling',
    'Text a friend something true',
    'Batch-plan tomorrow’s story sequence',
    'Record a voice memo of an idea instead of starting it',
    'Walk outside with no phone for fifteen minutes'
  ],

  KEYS: [
    { sphere: 'Life’s Work', key: '36.2', shadow: 'Turbulence', gift: 'Humanity', siddhi: 'Compassion',
      about: 'The shadow is craving intensity and the next new feeling. The gift is turning what you’ve lived through into something that helps people feel less alone. Your real stories matter more than polished information. The 2nd line means your genius shows up when you’re called out, not forced.',
      asks: ['Where can I share something real today instead of something polished?',
             'Notice the craving for intensity. Can I let the feeling be here without feeding it?',
             'Who needs to hear that they’re not alone in this?'] },
    { sphere: 'Evolution', key: '6.2', shadow: 'Conflict', gift: 'Diplomacy', siddhi: 'Peace',
      about: 'Your growth edge is emotional friction. When tension rises, the move is to let it settle before you act or post, rather than numbing it or pushing through.',
      asks: ['What tension am I carrying? Let it settle before I respond.',
             'Is there a conversation I’ve been avoiding? What’s the gentlest true thing I could say?'] },
    { sphere: 'Radiance', key: '11.4', shadow: 'Obscurity', gift: 'Idealism', siddhi: 'Light',
      about: 'The idea library. In shadow, visions that never land. In gift, ideals made real enough for people to use. The 4th line means you glow brightest through your close circle and community.',
      asks: ['Which idea is ready to become real, and which is a pretty daydream?',
             'Share one vision with someone in my close circle.'] },
    { sphere: 'Purpose', key: '12.4', shadow: 'Vanity', gift: 'Discrimination', siddhi: 'Purity',
      about: 'The shadow swings between self-doubt and self-focus, and comparison scrolling sends it into overdrive. The gift is discernment: what you say, what you let in, what you say no to.',
      asks: ['What will I say no to today?',
             'Choose my words carefully in one piece of content.',
             'Did anything I took in today make me feel less than? Mute it.'] }
  ],

  CHART: [
    { label: 'North Node Virgo · South Node Pisces', text: 'From dissolving into the ocean of content to crafting small, finished, useful things.' },
    { label: 'Pisces Sun, Mercury, Venus · Libra rising', text: 'Venus in Pisces is your chart ruler. Beauty and feeling are how you create, not a distraction from it.' },
    { label: 'Gemini Moon', text: 'Your feelings love variety, words and ideas. It’s part of why the feed tugs at you, and why making something new soothes you.' },
    { label: 'Virgo Mars', text: 'You work best in careful, finished, useful pieces. Sitting right on your North Node.' },
    { label: 'Cancer Midheaven', text: 'Public work rooted in home and nourishment.' },
    { label: '2/4 Manifesting Generator', text: 'Respond, don’t force. Real rest, not fake rest. Your network is your reach.' },
    { label: 'Emotional authority', text: 'Sleep on big yeses. Clarity comes over time, not in the moment.' },
    { label: 'Right Angle Cross of Eden', text: 'Your incarnation cross (36/6 | 11/12): keeping your wonder while you grow wise through real life.' },
    { label: 'Channel of Charisma (20–34)', text: 'Sacral power wired straight to your voice. When you act on a real yes, people feel it.' },
    { label: 'Channel of Openness (12–22)', text: 'Emotion expressed through words. Your mood shapes how your message lands, so speak when the wave feels right.' },
    { label: 'Gates 11, 17, 61', text: 'Ideas, opinions and the pressure to know. Share your ideas and opinions when you’re asked.' },
    { label: 'Pisces stellium in the 5th house', text: 'By Placidus houses, your Sun, Mercury and Venus sit in the house of creativity, joy and children. (By whole sign, the 6th: daily ritual.)' },
    { label: 'Life Path 33', text: 'The teacher and healer. You don’t have to do everything today to be doing enough.' }
  ],

  EXTRA_ASKS: ['What small thing can I finish completely today?'],

  RHYTHM: [
    { t: '07:00', label: 'Make before you take', type: 'make', note: 'Phone stays bricked until one thing is made.' },
    { t: '08:00', label: 'Breakfast and chores', type: 'family', note: '' },
    { t: '09:00', label: 'Work block', type: 'work', note: 'Post the clean way, through Business Suite.' },
    { t: '10:00', label: 'Family reading', type: 'school', note: '' },
    { t: '10:30', label: 'Lessons rotation', type: 'school', note: 'Each girl works independently while you teach the others.' },
    { t: '12:00', label: 'Lunch', type: 'family', note: '' },
    { t: '13:00', label: 'History or science', type: 'school', note: '' },
    { t: '15:00', label: 'Creation window', type: 'make', note: 'Work on an active project.' },
    { t: '17:00', label: 'IG window', type: 'work', note: 'Sticker stories and replies. Set a timer.' },
    { t: '20:00', label: 'Hermit time', type: 'hermit', note: 'Phone charging outside the bedroom.' },
    { t: '21:00', label: 'Evening reflection', type: 'reflect', note: '' }
  ],

  BLOCK_TYPES: {
    make:    'Make',
    hermit:  'Hermit',
    school:  'Homeschool',
    family:  'Family',
    work:    'Work',
    reflect: 'Reflect'
  },

  WAVES: [
    { id: 'up',     label: 'Riding high' },
    { id: 'steady', label: 'Steady' },
    { id: 'down',   label: 'In the trough' }
  ]
};
