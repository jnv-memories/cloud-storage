import "../styles/modal.css";


function ImageModal({

    url,

    close

}) {


    return (

        <div

            className="modal"

            onClick={close}

        >

            <img

                src={url}

                onClick={
                    e => e.stopPropagation()
                }

            />

        </div>

    );

}


export default ImageModal;