function unrollLoops( string ) {

    var pattern = /for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;

    function replace( match, start, end, snippet ) {

        var unroll = '';

        for ( var i = parseInt( start ); i < parseInt( end ); i ++ ) {

            unroll += snippet.replace( /\[ i \]/g, '[ ' + i + ' ]' );

        }

        return unroll;

    }

    return string.replace( pattern, replace );

}