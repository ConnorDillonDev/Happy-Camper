$('#submitReview').on('click', function(){
    if($('#no-rate').is(':checked')){
        $('#errorSpan').text('Select a rating.')
        return false;
    }
});
