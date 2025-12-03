# Seed Maker

A simple browser-based tool for generating random strings.

## Features

- Collects entropy from mouse movements and timing
- Uses the browser's Crypto API
- Preset lengths: 16, 32, 64, 128, 256 characters
- Customizable character sets
- History of recent generations
- Runs entirely client-side (nothing sent to any server)

## Usage

1. Move your mouse in the entropy box
2. Select your desired length and character types
3. Click Generate
4. Copy the result

## Live

[https://whenmoon-afk.github.io/seed-maker/](https://whenmoon-afk.github.io/seed-maker/)

## Notes

This tool is for personal use. It combines the browser's `crypto.getRandomValues()` with additional entropy from user interactions. No claims are made about cryptographic security for any particular use case—evaluate fitness for your own purposes.