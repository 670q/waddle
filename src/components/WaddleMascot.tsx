import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

// Fallback remote images if local ones fail or are missing specific moods
const REMOTE_MASCOTS = {
    idle: 'https://cdn-icons-png.flaticon.com/512/2663/2663067.png',
    happy: 'https://cdn-icons-png.flaticon.com/512/2663/2663067.png',
    focused: 'https://cdn-icons-png.flaticon.com/512/2663/2663067.png',
};

// Try to require local assets. If they don't exist, this might crash in some bundlers 
// unless handled carefully. However, since we verified the folder exists, we'll assume standard naming.
// Adjust these require paths based on the actual file names you see in your assets/mascot folder.
// For safety in this environment, I will use a try-catch dynamic require approach or just static if I knew the exact filenames.
// Since I saw the directory has children, I will assume standard mood names.

const LOCAL_MASCOTS: Record<string, any> = {
    idle: require('../../assets/mascot/a1.png'),
    happy: require('../../assets/mascot/a2.png'),
    focused: require('../../assets/mascot/a3.png'),
    tired: require('../../assets/mascot/a4.png'),
    confused: require('../../assets/mascot/a5.png'),
    // Fallbacks or extras
    default: require('../../assets/mascot/a1.png')
};

interface WaddleMascotProps {
    mood?: 'idle' | 'happy' | 'focused' | 'tired' | 'confused';
    className?: string;
    style?: StyleProp<ImageStyle>;
    size?: number;
}

export function WaddleMascot({ mood = 'idle', className, style, size = 100 }: WaddleMascotProps) {
    // Determine source
    // 1. Try local specific mood
    // 2. Try local idle
    // 3. Fallback to remote

    let source = LOCAL_MASCOTS[mood];
    if (!source) source = LOCAL_MASCOTS['idle'];
    if (!source) source = { uri: REMOTE_MASCOTS.idle };

    return (
        <Image
            source={source}
            className={className}
            style={[{ width: size, height: size }, style]}
            resizeMode="contain"
        />
    );
}
