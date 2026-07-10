import "../styles/upload.css";

function UploadProgress({ data, onRemove }) {
    return (
        <div className="uploadCard">
            <div className="uploadHeader">
                <div>
                    <strong>{data.file.name}</strong>
                    <div className="fileSize">
                        {(
                                data.file.size /
                                1024 /
                                1024
                            ).toFixed(2)
                        }{" MB"}
                    </div>
                </div>
                {
                data.status === "Waiting" &&
                    <button onClick={onRemove}>
                        Remove
                    </button>
                }
                {
                data.status === "Uploading" &&
                    <button onClick={data.onCancel}>
                        Cancel
                    </button>
                }
                {
                data.status === "Failed" &&
                    <button onClick={data.onRetry}>
                        Retry
                    </button>
                }
                {(data.status==="Cancelled")&&(
                    <button onClick={data.onRetry}>Retry</button>
                )}
            </div>

            <div className="progress">
                <div
                    className="progressFill"
                    style={{
                        width:
                        data.progress + "%"
                    }}
                />
            </div>

            <div className="details">
                <span>
                    {data.progress}%
                </span>
                <span>
                    {data.status}
                </span>
                <span>
                    {data.speed}
                </span>
                <span>
                    {data.eta}
                </span>
            </div>

            {
                data.result &&
                <div className="uploadResult">
                    <p>
                        Uploaded:
                    </p>
                    <input
                        value={
                            data.result.url
                        }
                        readOnly
                    />

                    <button
                        onClick={() =>
                            navigator.clipboard.writeText(
                                data.result.url
                            )
                        }
                    >
                       Copy URL
                    </button>
                </div>
            }
            {
                data.error &&
                <p className="error">
                    {data.error}
                </p>
            }
        </div>
    );
}
export default UploadProgress;