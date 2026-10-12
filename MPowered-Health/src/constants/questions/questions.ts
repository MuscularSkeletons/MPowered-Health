export function getPainLocationQuestions(latestPainLocations: string[] | null): string[] {
    // if no pain assessment completed, return default answers
    if (latestPainLocations === null || latestPainLocations.length === 0) {
        return [
            'What could be causing my pain?',
            'Could pain in different areas be related, or are they likely separate issues?',
        ];
    }
    var painLocationsString;
    // convert pain locations to string depending on the number of locations
    if (latestPainLocations.length === 1) {
        painLocationsString = latestPainLocations[0];
    } else if (latestPainLocations.length === 2) {
        painLocationsString = latestPainLocations.join(' and ');
    } else {
        painLocationsString = latestPainLocations.slice(0, -1).join(', ') + ', and ' + latestPainLocations.slice(-1);
    }

    if (latestPainLocations.length === 1) {
        return [
            `What could be causing pain in my ${painLocationsString}?`,
        ];
    } else {
        return [
        `What could be causing pain in my ${painLocationsString}?`,
        `Is pain in my ${painLocationsString} be related, or are they likely separate issues?`,
        ];
    }
}

export function getPainIntensityQuestions(currentPainLevel: number | null, 
                                            mildestPainLevel: number | null, 
                                            worstPainLevel: number | null, 
                                            averagePainLevel: number | null
                                        ): string[] {
    // if no pain assessment completed, return default answers
    if (currentPainLevel === null || mildestPainLevel === null || worstPainLevel === null || averagePainLevel === null) {
        return [
            'Even though I don\'t have pain right now, if I\'ve had severe pain at times, what could explain these flare-ups?',
            'Is it normal for pain to vary between mild and very severe?',
            'What can I do to better manage days when the pain is high?',
        ];
    } else {
        return [
            `My average pain over the past week has been around ${averagePainLevel} — what does this indicate?`,
            `Even though I don\'t have pain right now, I\'ve had severe pain at times (up to ${worstPainLevel}). What could explain these flare-ups?`,
            `Is it normal for pain to vary between mild (${mildestPainLevel}) and very severe (${worstPainLevel})?`,
            `What can I do to better manage days when the pain is high?`,
        ];
    }
}

export function getPainImpactQuestions(): string[] {
    return [
        'What treatments or therapies could help improve my mobility?',
        'Would physiotherapy or a specific exercise program be appropriate for me?',
        'Are there movements or activities I should avoid right now?',
        'My pain is making it hard to take care of myself independently — what can we do to improve this?',
        'Are there strategies, aids, or supports that could help with daily tasks?',
        'Should we adjust my treatment plan given how much this is affecting my independence?',
        'Is this level of impact typical for my condition?',
        'What options are available to improve my quality of life?',
    ];
}

export function getPainManagementQuestions(): string[] {
    return [
        'Are there additional investigations or referrals that might help?',
        'How can I prevent the pain from becoming severe again?',
        'What are realistic goals for improving my function and independence?',
    ];
}