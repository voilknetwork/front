/*global describe, global, before:false, it*/
import assert from 'assert';
import proxifyImageUrl from './ProxifyUrl';

describe('ProxifyUrl', () => {
    beforeAll(() => {
        global.$SHR_Config = { img_proxy_prefix: 'https://voilknetworkimages.com/' };
    });
    it('naked URL', () => {
        testCase(
            'https://example.com/img.png',
            '100x200',
            'https://voilknetworkimages.com/100x200/https://example.com/img.png'
        );
        testCase(
            'https://example.com/img.png',
            '0x0',
            'https://voilknetworkimages.com/640x0/https://example.com/img.png'
        );
        testCase(
            'https://example.com/img.png',
            true,
            'https://voilknetworkimages.com/640x0/https://example.com/img.png'
        );
        testCase(
            'https://example.com/img.png',
            false,
            'https://example.com/img.png'
        );
    });
    it('naked voilknetwork hosted URL', () => {
        testCase(
            'https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            '256x512',
            'https://voilknetworkimages.com/256x512/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
        testCase(
            'https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            false,
            'https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
    });
    it('proxied voilknetwork hosted URL', () => {
        testCase(
            'https://voilknetworkimages.com/0x0/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            '256x512',
            'https://voilknetworkimages.com/256x512/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
        testCase(
            'https://voilknetworkimages.com/256x512/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            false,
            'https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
    });
    it('proxied URL', () => {
        testCase(
            'https://voilknetworkimages.com/0x0/https://example.com/img.png',
            '100x200',
            'https://voilknetworkimages.com/100x200/https://example.com/img.png'
        );
        testCase(
            'https://voilknetworkimages.com/256x512/https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000',
            '100x200',
            'https://voilknetworkimages.com/100x200/https://peopledotcom.files.wordpress.com/2017/09/grumpy-harvey-cat.jpg?w=2000'
        );
        testCase(
            'https://voilknetworkimages.com/0x0/https://example.com/img.png',
            false,
            'https://example.com/img.png'
        );
    });
    it('double-proxied URL', () => {
        testCase(
            'https://voilknetworkimages.com/0x0/https://voilknetworkimages.com/0x0/https://example.com/img.png',
            '100x200',
            'https://voilknetworkimages.com/100x200/https://example.com/img.png'
        );
        testCase(
            'https://voilknetworkimages.com/0x0/https://voilknetworkimages.com/256x512/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            false,
            'https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
    });
    it('preserve dimensions - single-proxied URL', () => {
        //simple preservation
        testCase(
            'https://voilknetworkdevimages.com/100x200/https://example.com/img.png',
            true,
            'https://voilknetworkimages.com/100x200/https://example.com/img.png'
        );
        testCase(
            'https://voilknetworkdevimages.com/1001x2001/https://example.com/img.png',
            true,
            'https://voilknetworkimages.com/1001x2001/https://example.com/img.png'
        );
    });
    it('preserve dimensions - double-proxied URL', () => {
        //simple preservation at a 2 nesting level
        //foreign domain
        testCase(
            'https://voilknetworkimages.com/100x200/https://voilknetworkimages.com/0x0/https://example.com/img.png',
            true,
            'https://voilknetworkimages.com/100x200/https://example.com/img.png'
        );
        testCase(
            'https://voilknetworkdevimages.com/1001x2001/https://voilknetworkimages.com/0x0/https://example.com/img.png',
            true,
            'https://voilknetworkimages.com/1001x2001/https://example.com/img.png'
        );
        //voilknetwork domain
        testCase(
            'https://voilknetworkdevimages.com/1001x2001/https://voilknetworkimages.com/0x0/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            'https://voilknetworkimages.com/1001x2001/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
    });
    it('preserve dimensions - strip proxies & dimensions when appropriate', () => {
        //simple preservation at a 2 nesting level
        //voilknetwork domain
        testCase(
            'https://voilknetworkimages.com/0x0/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            'https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
        //foreign domain
        testCase(
            'https://voilknetworkimages.com/0x0/https://example.com/img.png',
            true,
            'https://voilknetworkimages.com/640x0/https://example.com/img.png'
        );
        //case where last is natural sizing, assumes natural sizing - straight to direct voilknetwork file url
        testCase(
            'https://voilknetworkimages.com/0x0/https://voilknetworkimages.com/100x100/https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg',
            true,
            'https://voilknetworkimages.com/DQmaJe2Tt5kmVUaFhse1KTEr4N1g9piMgD3YjPEQhkZi3HR/30day-positivity-challenge.jpg'
        );
        //case where last is natural sizing, assumes natural sizing - straight to direct voilknetwork /0x0/ domain host url
        testCase(
            'https://voilknetworkimages.com/0x0/https://voilknetworkimages.com/100x100/https://example.com/img.png',
            true,
            'https://voilknetworkimages.com/640x0/https://example.com/img.png'
        );
    });
});

const testCase = (inputUrl, outputDims, expectedUrl) => {
    const outputUrl = proxifyImageUrl(inputUrl, outputDims);
    assert.equal(
        outputUrl,
        expectedUrl,
        `(${inputUrl}, ${outputDims}) should return ${
            expectedUrl
        }. output was ${outputUrl}`
    );
};
