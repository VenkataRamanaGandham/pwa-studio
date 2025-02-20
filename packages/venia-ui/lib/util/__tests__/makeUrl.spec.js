import makeUrl from '../makeUrl';

const mediaPath = '/media';
const productBase = '/catalog/product';
const categoryBase = '/catalog/category';
const defaultParams = 'auto=webp&format=pjpg';

const relativePath = '/some/path/to/img.jpg';
const absoluteUrls = [
    'data://example.com/foo.png',
    'http://example.com/bar.png',
    'https://example.com/baz.png'
];

test('returns absolute url unmodified when called with no options', () => {
    absoluteUrls.forEach(url => {
        expect(makeUrl(url)).toBe(url);
    });
});

test('returns relative path unmodified when called with no options', () => {
    expect(makeUrl(relativePath)).toBe(relativePath);
});

test('adds no behavior when type is unrecognized', () => {
    const invalidType = 'invalid';
    expect(makeUrl(relativePath, { type: invalidType })).toEqual(relativePath);
});

test('prepends media path for product images', () => {
    expect(makeUrl(relativePath, { type: 'image-product' })).toBe(
        `${mediaPath}${productBase}${relativePath}?${defaultParams}`
    );
});

test('prepends media path for relative category images', () => {
    expect(makeUrl(relativePath, { type: 'image-category' })).toBe(
        `${mediaPath}${categoryBase}${relativePath}?${defaultParams}`
    );
});

test("doesn't prepend media path if it's already included", () => {
    const cachedPath = `${productBase}/foo.jpg`;

    expect(
        makeUrl(cachedPath, { type: 'image-product' }).startsWith(cachedPath)
    ).toBeTruthy();
});

test('appends opt params to absolute url when width is provided', () => {
    const width = 100;
    const raw = absoluteUrls[2];

    expect(makeUrl(raw, { type: 'image-product', width })).toBe(
        `https://example.com/baz.png?auto=webp&format=pjpg&width=100`
    );
});

test('appends all configured arguments for wysiwyg images', () => {
    const raw = absoluteUrls[2];

    expect(
        makeUrl(raw, {
            type: 'image-wyswiyg',
            width: 100,
            height: 100,
            quality: 85,
            crop: false,
            fit: 'cover'
        })
    ).toBe(
        `https://example.com/baz.png?auto=webp&format=pjpg&width=100&height=100&quality=85&crop=false&fit=cover`
    );
});

test('includes media path when rewriting for resizing', () => {
    const width = 100;

    expect(makeUrl(relativePath, { width, type: 'image-product' })).toBe(
        `${mediaPath}${productBase}${relativePath}?auto=webp&format=pjpg&width=100`
    );
});

test('removes absolute origin if configured to', () => {
    jest.resetModules();
    const width = 100;
    process.env.MAGENTO_BACKEND_URL = 'https://cdn.origin:8000/';
    const htmlTag = document.querySelector('html');
    htmlTag.setAttribute(
        'data-media-backend',
        `https://cdn.origin:8000${mediaPath}`
    );
    htmlTag.setAttribute('data-image-optimizing-origin', 'onboard');
    const makeUrlAbs = require('../makeUrl').default;
    expect(
        makeUrlAbs(
            `https://cdn.origin:8000${mediaPath}${productBase}${relativePath}?auto=webp&format=pjpg&width=100`,
            { width, type: 'image-product' }
        )
    ).toBe(
        `${mediaPath}${productBase}${relativePath}?auto=webp&format=pjpg&width=100`
    );
});

test('removes absolute origin if configured to - with path', () => {
    jest.resetModules();
    const width = 100;
    process.env.MAGENTO_BACKEND_URL = 'https://cdn.origin:8000/venia/';
    const htmlTag = document.querySelector('html');
    htmlTag.setAttribute(
        'data-media-backend',
        `https://cdn.origin:8000/venia${mediaPath}`
    );
    htmlTag.setAttribute('data-image-optimizing-origin', 'onboard');
    const makeUrlAbs = require('../makeUrl').default;
    expect(
        makeUrlAbs(
            `https://cdn.origin:8000/venia${mediaPath}${productBase}${relativePath}?auto=webp&format=pjpg&width=100`,
            { width, type: 'image-product' }
        )
    ).toBe(
        `${mediaPath}${productBase}${relativePath}?auto=webp&format=pjpg&width=100`
    );
});

test('prepends absolute origin if configured to', () => {
    jest.resetModules();
    const width = 100;
    const htmlTag = document.querySelector('html');
    htmlTag.setAttribute(
        'data-media-backend',
        `https://cdn.origin:9000${mediaPath}`
    );
    htmlTag.setAttribute('data-image-optimizing-origin', 'backend');
    const makeUrlAbs = require('../makeUrl').default;
    expect(
        makeUrlAbs(
            `${mediaPath}${productBase}${relativePath}?auto=webp&format=pjpg&width=100`,
            { width, type: 'image-product' }
        )
    ).toBe(
        `https://cdn.origin:9000${mediaPath}${productBase}${relativePath}?auto=webp&format=pjpg&width=100`
    );
});
