export const mascotAssets = {
    wave: require('../../assets/mascot/a1.png'), // TODO: Verify if a1 is 'wave'
    thinking: require('../../assets/mascot/a2.png'), // TODO: Verify Mapping
    idle: require('../../assets/mascot/a3.png'), // TODO: Verify Mapping
    celebrate: require('../../assets/mascot/a4.png'), // TODO: Verify Mapping
    cool: require('../../assets/mascot/a5.png'), // TODO: Verify Mapping
    paywall: require('../../assets/mascot/a6.png'), // TODO: Verify Mapping
    // Extras if needed
    a7: require('../../assets/mascot/a7.png'),
    a8: require('../../assets/mascot/a8.png'),
    a9: require('../../assets/mascot/a9.png'),
};

export type MascotMood = keyof typeof mascotAssets;
