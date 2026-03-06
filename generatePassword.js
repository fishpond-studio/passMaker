function generatePassword(charset, random) {
    var result = [];
    for (var i = 0; i < random.length; i++) {
        result[i] = charset[random[i]];
    }
    return result.join('');
}
