
//글쓰기 또는 수정페이지 

/* Legacy BoardWritePage implementation (wrapped to avoid build errors).
 * Keep until backend/API spec is finalized, then remove.
 */
/*
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import styles from "./BoardWritePage.module.css"
import Input from "../../../components/commons/ui/Input";
import Button from "../../../components/commons/ui/Button";
import { useEffect, useState } from "react";
import boardApi from "../../../api/boardApi";

function BoardWritePage(){
    const {boardNo} = useParams();  //수정시에만 존재하는 글번호
    const navigate = useNavigate();
    const {user} = useAuth();

    //현재 요청이 글작성인지 수정인지 판별용 논리값 
    const isEditMode =  !!boardNo; //boardNo있으면 true

    //입력폼에 작성된 값 처리 상태값
    const [formData,setFormData] = useState({
       boardTitle : '',
       boardContent : '',
       boardWriter : user?.userId || '' 
    });

    const [file,setFile] = useState(null);//파일정보 
    const [existingFile,setExistingFile] = useState(null);
    const [isLoading,setIsLoading] = useState(false);



    //수정 모드일땐 기존 게시글 정보 불러오기 
    useEffect(()=>{
        if(isEditMode){
            const fetchBoard = async ()=>{
                try{
                    const data = await boardApi.getDetail(boardNo);
                    setFormData({
                        boardTitle : data.boardTitle,
                        boardContent : data.boardContent,
                        boardWriter : data.boardWriter
                    });

                    //파일정보 있으면 추가 
                    if(data.changeName){
                        setExistingFile({
                            originName : data.originName,
                            changeName : data.changeName
                        });
                    }
                }catch(error){
                    console.error('게시글 조회 실패',error);
                    alert('게시글을 불러올 수 없습니다.');
                    navigate('/board');//목록으로 보내기 
                }
            };

            fetchBoard();//호출
        }

    },[boardNo,isEditMode,navigate]);//게시글번호,수정모드상태,이동함수 변경시 다시 불러오기 

    const handleChange = (e) =>{
        const {name,value} = e.target;
        setFormData((prev)=>({
            ...prev,
            [name] : value
        }));
    };

    const handleSubmit = async (e)=>{
        e.preventDefault(); //기본 이벤트 막아주기 

        //입력값없이 공백만 있을때 처리 안되도록 막아주기
        if(!formData.boardTitle.trim() || !formData.boardContent.trim()){
            alert('제목과 내용을 입력하세요');
            return;
        }

        setIsLoading(true);

        try{
            //multipart 형식으로 전달할땐 FormData 객체를 생성하여 해당 객체에 데이터를 담아 요청한다.
            const submitData = new FormData();

            submitData.append('boardTitle',formData.boardTitle);
            submitData.append('boardContent',formData.boardContent);
            submitData.append('boardWriter',formData.boardWriter);

            //만약 파일정보가 있다면 파일 넣기
            if(file){
                submitData.append("uploadFile",file);
            }

            //수정시에 기존 파일 정보 포함시키기 
            if(isEditMode && existingFile){
                submitData.append('boardNo',boardNo);
                submitData.append('originName',existingFile.originName);
                submitData.append('changeName',existingFile.changeName);
            }

            //조건에 따라서 수정 또는 작성 요청
            if(isEditMode){ //수정 요청

                await boardApi.update(submitData);
                alert('게시글이 수정되었습니다.');
                navigate(`/board/${boardNo}`); //상세페이지 요청


            }else{//작성 요청
                await boardApi.create(submitData); //작성 데이터를 전달하기 
                alert('게시글 등록 성공');
                navigate("/board")
            }
        }catch(error){

            console.error(error);

            alert(isEditMode?'게시글 수정에 실패했습니다':'게시글 등록에 실패했습니다');
        }finally{
            setIsLoading(false);
        }

    }   

    //파일 핸들러
    const handleFileChange = (e)=>{
        setFile(e.target.files[0]);
    }

    
    //취소 버튼 
    const handleCancel = () =>{
        if(isEditMode){//수정 작업일땐 
            navigate(`/board/${boardNo}`);  //게시글 상세보기 
        }else{//작성 작업일땐 
            navigate('/board'); //게시글 목록으로 
        }
    }

    return (
        <div className="container">
            <div className={styles.wrapper}>
                <h2 className={styles.title}>
                    {isEditMode?'게시글 수정하기':'게시글 작성하기'}
                </h2>

                <form  onSubmit={handleSubmit}
                        className={styles.form}>
                  <div className={styles.row}>
                    <label className={styles.label}>제목</label>
                    <Input 
                        type="text"
                        name="boardTitle"
                        value={formData.boardTitle}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요"
                        required
                        fullWidth
                    />
                  </div>

                   <div className={styles.row}>
                    <label className={styles.label}>작성자</label>
                    <Input 
                        type="text"
                        name="boardWriter"
                        value={formData.boardWriter}
                        readOnly
                        fullWidth
                    />
                  </div>


                    <div className={styles.row}>
                        <label className={styles.label}>첨부파일</label>
                        <div className={styles.fileArea}>

                            <input 
                                type="file"
                                onChange={handleFileChange}
                                className={styles.fileInput}  
                                />
                            {/* 파일이 있다면 현재파일정보 보여주기 *\/}
                            {existingFile && !file &&(

                                <p className={styles.existingFile}>
                                현재 파일 : {existingFile.originName}
                                </p>
                            )}
                        </div>
                  </div>

                  <div className={styles.row}>
                    <label className={styles.label}>내용</label>
                    <textarea 
                        name="boardContent"
                        value={formData.boardContent}
                        onChange={handleChange}
                        placeholder="내용을 입력하세요"
                        required
                        className ={styles.textarea}
                    />
                  </div>

                  <div className={styles.buttons}>
                    <Button type="submit" variant="primary" loading={isLoading}>
                        {isEditMode?'수정하기':'등록하기'}
                    </Button>
                    <Button type="button" variant="danger" onClick={handleCancel}>
                        {isEditMode?'이전으로':'취소하기'}
                    </Button>
                  </div>
                </form>
            </div>
        </div>
    )
}

export default BoardWritePage;
*/

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import axios from 'axios';
import Input from '../../../common/Input';
import Button from '../../../common/Button';
import styles from './BoardWritePage.module.css';

function BoardWritePage() {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = useMemo(() => !!boardNo, [boardNo]);

  const [formData, setFormData] = useState({
    boardTitle: '',
    boardContent: '',
    boardWriter: user?.userId || user?.id || '',
  });

  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        boardWriter: prev.boardWriter || user?.userId || user?.id || '',
      }));
    }
  }, [isEditMode, user]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchBoard = async () => {
      try {
        const { data } = await axios.get(`/dykj/api/boards/${boardNo}`);
        setFormData({
          boardTitle: data.boardTitle ?? data.title ?? '',
          boardContent: data.boardContent ?? data.content ?? '',
          boardWriter: data.boardWriter ?? data.writer ?? user?.userId ?? user?.id ?? '',
        });

        if (data.changeName || data.originName) {
          setExistingFile({
            originName: data.originName,
            changeName: data.changeName,
          });
        }
      } catch (error) {
        console.error('게시글 조회 실패', error);
        alert('게시글을 불러올 수 없습니다.');
        navigate('/board');
      }
    };

    fetchBoard();
  }, [boardNo, isEditMode, navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.boardTitle.trim() || !formData.boardContent.trim()) {
      alert('제목과 내용을 입력하세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('boardTitle', formData.boardTitle);
      submitData.append('boardContent', formData.boardContent);
      submitData.append('boardWriter', formData.boardWriter);

      if (file) submitData.append('uploadFile', file);

      if (isEditMode) {
        submitData.append('boardNo', boardNo);
        if (existingFile?.originName) submitData.append('originName', existingFile.originName);
        if (existingFile?.changeName) submitData.append('changeName', existingFile.changeName);

        await axios.put(`/dykj/api/boards/${boardNo}`, submitData);
        alert('게시글이 수정되었습니다.');
        navigate(`/board/${boardNo}`);
      } else {
        await axios.post('/dykj/api/boards', submitData);
        alert('게시글이 등록되었습니다.');
        navigate('/board');
      }
    } catch (error) {
      console.error(error);
      alert(isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) navigate(`/board/${boardNo}`);
    else navigate('/board');
  };

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{isEditMode ? '게시글 수정하기' : '게시글 작성하기'}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label}>제목</label>
            <Input
              type="text"
              name="boardTitle"
              value={formData.boardTitle}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              required
              fullWidth
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>작성자</label>
            <Input type="text" name="boardWriter" value={formData.boardWriter} readOnly fullWidth />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>첨부파일</label>
            <div className={styles.fileArea}>
              <input type="file" onChange={handleFileChange} className={styles.fileInput} />
              {existingFile && !file && (
                <p className={styles.existingFile}>현재 파일: {existingFile.originName || '(이름 없음)'}</p>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>내용</label>
            <textarea
              name="boardContent"
              value={formData.boardContent}
              onChange={handleChange}
              placeholder="내용을 입력하세요"
              required
              className={styles.textarea}
            />
          </div>

          <div className={styles.buttons}>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditMode ? '수정하기' : '등록하기'}
            </Button>
            <Button type="button" variant="danger" onClick={handleCancel} disabled={isSubmitting}>
              {isEditMode ? '이전으로' : '취소하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BoardWritePage;
