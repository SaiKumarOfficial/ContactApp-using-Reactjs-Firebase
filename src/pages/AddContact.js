import React,{ useState,useContext, useEffect} from "react";
import firebase from "firebase/compat/app"

import {
    Container,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Spinner,
    Row, 
    Col
} from "reactstrap";

import { readAndCompressImage } from "browser-image-resizer";

import { imageConfig } from "../utils/config";
import {MdAddCircleOutline} from "react-icons/md";

import { v4 } from "uuid";

//context
import { ContactContext } from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";

import {useHistory} from "react-router-dom";

import {toast} from "react-toastify"

const AddContact = () => {
    // destructuring state and dispatch from context state
  const { state, dispatch } = useContext(ContactContext);

  const { contactToUpdate, contactToUpdateKey } = state;

  // history hooks from react router dom to send to different page
  const history = useHistory();

  // simple state of all component
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [star, setStar] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  // when their is the contact to update in the Context state
  // then setting state with the value of the contact
  // will changes only when the contact to update changes
  useEffect(() => {
    if (contactToUpdate) {
      setName(contactToUpdate.name);
      setEmail(contactToUpdate.email);
      setPhoneNumber(contactToUpdate.phoneNumber);
      setAddress(contactToUpdate.address);
      setStar(contactToUpdate.star);
      setDownloadUrl(contactToUpdate.picture);

      // also setting is update to true to make the update action instead the addContact action
      setIsUpdate(true);
    }
  }, [contactToUpdate]);

  const imagePicker = async e => {
    try {
        const file = e.target.files[0]

        var metadata = {
            contentType: file.type
        }
        let resizedImage = await readAndCompressImage(file,imageConfig)

        const storageRef = await firebase.storage().ref()
        var uploadTask = storageRef.child('images/' + file.name)
                        .put(resizedImage, metadata)
        uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED, 
            snapshot => {
                setIsUploading(true)
                var progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100 

                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        setIsUploading(fals)
                        console.log("Uploading is paused")
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        setIsUploading(fals)
                        console.log("Uploading is progress..")
                        break;
                }
                if (progress == 100) {
                    setIsUploading(false)
                    toast("Something went wrong0", {type: "error"})    
                }
            },
            error => {
                toast("something is wrong in state change", { type: "error" });
              },
              () => {
                uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then(downloadURL => {
                    setDownloadUrl(downloadURL);
                  })
                  .catch(err => console.log(err));
              }
        );
        
    } catch (error) {
        console.error(error)
        toast("Something went wrong", {type: "error"})
    }
  };

  

}

export default AddContact;