// This is Buffer implementation used in SEA. Functionality is mostly
// compatible with NodeJS 'safe-buffer' and is used for encoding conversions
// between binary and 'hex' | 'utf8' | 'base64'
// See documentation and validation for safe implementation in:
// https://github.com/feross/safe-buffer#update
import BufferArray from './buffer-array';
import { base64 } from './base64';

function SafeBuffer(...props: any[])
{
    console.warn('new SafeBuffer() is depreciated, please use SafeBuffer.from()');
    return (<any>SafeBuffer).from(...props)
}

SafeBuffer.prototype = Object.create(Array.prototype);
Object.assign(SafeBuffer, {
    // (data, enc) where typeof data === 'string' then enc === 'utf8'|'hex'|'base64'
    from()
    {
        if (!Object.keys(arguments).length)
        {
            throw new TypeError(
                'First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.'
            )
        }
        const input = arguments[0];
        let buf;
        if (typeof input === 'string')
        {
            const enc = arguments[1] || 'utf8';
            if (enc === 'hex')
            {
                const bytes = (<any>input)
                    .match(/([\da-fA-F]{2})/g)
                    .map((byte: string) => parseInt(byte, 16));
                if (!bytes || !bytes.length)
                {
                    throw new TypeError('Invalid first argument for type \'hex\'.')
                }
                buf = BufferArray.from(bytes)
            }
            else if (enc === 'utf8')
            {
                const length = input.length;
                const words  = new Uint16Array(length);
                for (let i = 0; i < length; i++)
                {
                    words[i] = input.charCodeAt(i)
                }
                buf = BufferArray.from(words)
            }
            else if (enc === 'base64')
            {
                const dec    = base64.atob(input);
                const length = dec.length;
                const bytes  = new Uint8Array(length);
                for (let i = 0; i < length; i++)
                {
                    bytes[i] = dec.charCodeAt(i)
                }
                buf = BufferArray.from(bytes)
            }
            else if (enc === 'binary')
            {
                buf = BufferArray.from(input)
            }
            else
            {
                console.info('SafeBuffer.from unknown encoding: ' + enc)
            }
            return buf
        }
        const length = input?.byteLength
            ? input.byteLength
            : input?.length
                ? input?.length
                : null;

        if (length)
        {
            let buf;
            if (input instanceof ArrayBuffer)
            {
                buf = new Uint8Array(input)
            }
            return BufferArray.from(buf || input)
        }
    },
    // This is 'safe-buffer.alloc' sans encoding support
    alloc(length: number, fill = 0 /*, enc */)
    {
        return BufferArray.from(
            new Uint8Array(Array.from({ length: length }, () => fill))
        )
    },
    // This is normal UNSAFE 'buffer.alloc' or 'new Buffer(length)' - don't use!
    allocUnsafe(length: number)
    {
        return BufferArray.from(new Uint8Array(Array.from({ length: length })))
    },
    // This puts together array of array like members
    concat(arr: any[])
    {
        // octet array
        if (!Array.isArray(arr))
        {
            throw new TypeError(
                'First argument must be Array containing ArrayBuffer or Uint8Array instances.'
            )
        }
        return BufferArray.from(
            arr.reduce((ret, item) => ret.concat(Array.from(item)), [])
        )
    }
});
SafeBuffer.prototype.from     = (<any>SafeBuffer).from;
SafeBuffer.prototype.toString = BufferArray.prototype.toString;

export default <any>SafeBuffer;

